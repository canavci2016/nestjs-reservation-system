import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/database/entities/company.entity';
import { FindManyOptions, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { FileUploadService } from '../../shared/modules/file-upload/file-upload.service';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private repository: Repository<Company>,
    private readonly fileUploadService: FileUploadService,
    private readonly i18n: I18nService,
  ) {
    this.logger.log('CompanyService initialized');
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
    const companyMap = new Map(Object.entries(company));

    const companyObj = await this.findOne({
      userName: companyMap.get('userName') as string,
    });

    if (companyObj) {
      throw new ConflictException(
        `company with username "${companyMap.get('userName') as string}" already exists`,
      );
    }

    if (!companyMap.has('secretKey')) {
      companyMap.set('secretKey', `API_SECRET_${Date.now()}`);
    }

    const companyObjWithSecret = await this.findOneBySecretKey(
      companyMap.get('secretKey') as string,
    );

    if (companyObjWithSecret) {
      throw new ConflictException(
        `company with secret key "${companyMap.get('secretKey') as string}" already exists`,
      );
    }

    if (companyMap.get('email')) {
      const companyObjWithEmail = await this.findOne({
        email: companyMap.get('email') as string,
      });
      if (companyObjWithEmail) {
        throw new ConflictException(
          `company with email  "${companyMap.get('email') as string}" already exists`,
        );
      }
    }

    if (companyMap.has('password')) {
      companyMap.set(
        'password',
        await this.generateHashedPassword(companyMap.get('password') as string),
      );
    }

    const savedCompany = await this.repository.save(
      Object.fromEntries(companyMap),
    );

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

    if (payloadMap.get('email')) {
      const existingCompany = await this.findOne({
        email: payloadMap.get('email') as string,
      });

      if (existingCompany && existingCompany.id !== id) {
        throw new ConflictException(
          this.i18n.translate('company.EMAIL_EXISTS', {
            args: { value: payloadMap.get('email') as string },
            lang: 'tr',
          }),
        );
      }
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
