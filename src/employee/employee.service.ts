import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { FindAllOptions } from './interfaces/find-all-options.interface';
import { Employee } from 'src/database/entities/employee.entity';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';
import { AwsService } from 'src/core/modules/aws/aws.service';

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
    return this.repository
      .createQueryBuilder()
      .update()
      .set(payload)
      .where('id = :id', { id })
      .execute();
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
    payload: Partial<Employee> & { photo: Promise<FileUpload> },
  ) {
    const { photo, ...data } = payload;
    if (typeof photo != 'undefined' || photo != null) {
      const imageFile: FileUpload = await photo;
      const fileName = `${condition.companyId}/employees/${condition.id}/profile`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );

      data.photoUrl = filePath.Location;
    }

    return await this.repository
      .createQueryBuilder()
      .update(Employee)
      .set(data)
      .where(condition)
      .execute();
  }
}
