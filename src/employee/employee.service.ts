import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { FindAllOptions } from './interfaces/find-all-options.interface';
import { Employee } from 'src/database/entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private repository: Repository<Employee>,
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

  async save(payload: Partial<Omit<Employee, 'availabilities'>>) {
    return this.repository.save(payload);
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
    payload: Partial<Employee>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(Employee)
      .set(payload)
      .where(condition)
      .execute();
  }
}
