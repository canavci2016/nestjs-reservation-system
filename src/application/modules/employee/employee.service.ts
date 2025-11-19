import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { FindAllOptions } from './interfaces/find-all-options.interface';
import { Employee } from 'src/database/entities/employee.entity';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';
import { AwsService } from 'src/core/modules/aws/aws.service';
import * as argon2 from 'argon2';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private repository: Repository<Employee>,
    private readonly awsService: AwsService,
  ) {
    console.log('CompanyService initialized');
  }

  findAll(options: FindAllOptions | null = null): Promise<Employee[]> {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    if (options?.isActive) {
      whereQuery['isActive'] = options.isActive;
    }

    query['where'] = whereQuery;

    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };

    return this.repository.find(query);
  }

  find(query: FindManyOptions = {}) {
    return this.repository.find(query);
  }

  findOne(payload: FindOptionsWhere<Employee>): Promise<Employee | null> {
    return this.repository.findOneBy(payload);
  }

  async save(
    payload: Partial<
      Omit<Employee, 'availabilities'> & { photo: Promise<FileUpload> }
    >,
  ) {
    if (payload.password?.trim()) {
      payload.password = await this.generateHashedPassword(payload.password);
    }

    const model = await this.repository.save(payload);

    if (typeof payload.photo != 'undefined' || payload.photo != null) {
      const imageFile: FileUpload = await payload.photo;
      const fileName = `${payload.companyId}/employees/${model.id}/profile`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );

      const res = await this.updateById(model.id, {
        photoUrl: filePath.Location,
      });

      return true;
    }

    return false;
  }

  async updateById(id: string, payload: Partial<Employee>) {
    const payloadMap = new Map(Object.entries(payload));

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
        .update()
        .set(Object.fromEntries(payloadMap))
        .where('id = :id', { id })
        .execute();
    }
  }

  async deleteById(condition: Pick<Employee, 'id' | 'companyId'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Employee)
      .softDelete()
      .where(condition)
      .execute();

    return result;
  }

  async updateByIdAndCompany(
    condition: Pick<Employee, 'id' | 'companyId'>,
    payload: Partial<Employee> & { photo?: Promise<FileUpload> },
  ) {
    const { photo, ...data } = payload;
    const payloadMap = new Map(Object.entries(data));

    if (payloadMap.get('password')) {
      payloadMap.set(
        'password',
        await this.generateHashedPassword(payloadMap.get('password') as string),
      );
    } else if (payloadMap.has('password')) {
      payloadMap.delete('password');
    }

    if (typeof photo != 'undefined' || photo != null) {
      const imageFile: FileUpload = await photo;
      const fileName = `${condition.companyId}/employees/${condition.id}/profile`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );

      if (filePath.Location) {
        payloadMap.set('photoUrl', filePath.Location);
      }
    }

    return await this.repository
      .createQueryBuilder()
      .update(Employee)
      .set(Object.fromEntries(payloadMap))
      .where(condition)
      .execute();
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

  async verifyPassword(employee: Employee, password: string): Promise<boolean> {
    return argon2.verify(employee.password, password);
  }
}
