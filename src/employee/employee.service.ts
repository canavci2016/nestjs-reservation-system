import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { Repository } from 'typeorm';
import { SaveEmployee } from './interfaces/save-employee.interface';
import { FindAllOptions } from './interfaces/find-all-options.interface';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private repository: Repository<Employee>,
  ) {
    console.log('CompanyService initialized');
  }

  getHello(): string {
    return 'Hello World!';
  }

  findAll(options: FindAllOptions | null = null): Promise<Employee[]> {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    whereQuery['isActive'] = true;

    query['where'] = whereQuery;

    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };

    return this.repository.find(query);
  }

  findOne(payload: Partial<Employee>): Promise<Employee | null> {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveEmployee): Promise<Employee> {
    return this.repository.save(payload);
  }
}
