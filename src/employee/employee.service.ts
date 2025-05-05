import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { Repository } from 'typeorm';
import { SaveEmployee } from './interfaces/save-employee.interface';

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

  findAll(): Promise<Employee[]> {
    return this.repository.find();
  }

  findOne(payload: Partial<Employee>): Promise<Employee | null> {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveEmployee): Promise<Employee> {
    return this.repository.save(payload);
  }
}
