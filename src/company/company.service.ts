import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/database/entities/company.entity';
import { FindManyOptions, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { FileUploadService } from 'src/shared/modules/file-upload/file-upload.service';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private repository: Repository<Company>,
    private readonly fileUploadService: FileUploadService,
  ) {
    console.log('CompanyService initialized');
  }

  findAll(query: FindManyOptions = {}): Promise<Company[]> {
    return this.repository.find(query);
  }

  findOne(payload: Partial<Company>): Promise<Company | null> {
    return this.repository.findOneBy(payload);
  }

  findOneBySecretKey(secretKey: string): Promise<Company | null> {
    return this.repository.findOneBy({ secretKey });
  }

  async save(company: Partial<Company & { photo?: Promise<FileUpload> }>) {
    const companyObj = await this.findOne({ userName: company.userName });
    if (companyObj) {
      throw new ConflictException(
        `company with username "${company.userName}" already exists`,
      );
    }

    if (company.password?.trim()) {
      company.password = await this.generateHashedPassword(company.password);
    }

    const savedCompany = await this.repository.save(company);

    // Handle photo upload after saving the company
    if (company.photo) {
      const uploadedPhotoUrl = await this.fileUploadService.company(
        company.photo,
        {
          companyId: savedCompany.id,
        },
      );

      if (uploadedPhotoUrl) {
        await this.updateById(savedCompany.id, { photoUrl: uploadedPhotoUrl });
        savedCompany.photoUrl = uploadedPhotoUrl;
      }
    }

    return savedCompany;
  }

  async generateHashedPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      salt: Buffer.from('password12345678'), // 16 bytes salt
    }); // Using a fixed salt for demonstration; in production, use a unique salt per password
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await this.generateHashedPassword(newPassword);
    await this.updateById(userId, { password: passwordHash });
  }

  async verifyPassword(company: Company, password: string): Promise<boolean> {
    return argon2.verify(company.password, password);
  }

  async updateById(
    id: string,
    payload: Partial<Company & { photo?: Promise<FileUpload> }>,
  ) {
    const { photo, ...data } = payload;
    const payloadMap = new Map(Object.entries(data));

    // Handle photo upload first
    const uploadedPhotoUrl = await this.fileUploadService.company(photo, {
      companyId: id,
    });

    if (uploadedPhotoUrl) {
      payloadMap.set('photoUrl', uploadedPhotoUrl);
    }

    if (payloadMap.size > 0) {
      if (payloadMap.get('password')) {
        payloadMap.set(
          'password',
          await this.generateHashedPassword(
            payloadMap.get('password') as string,
          ),
        );
      } else if (payloadMap.has('password')) {
        payloadMap.delete('password');
      }

      return this.repository
        .createQueryBuilder()
        .update(Company)
        .set(Object.fromEntries(payloadMap))
        .where('id = :id', { id })
        .execute();
    }
  }

  async deleteById(id: string) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Company)
      .where('id = :id', { id })
      .execute();

    return result;
  }
}
