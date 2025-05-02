import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private repository: Repository<Company>,
  ) {
    console.log('CompanyService initialized');
  }

  getHello(): string {
    return 'Hello World!';
  }

  findAll(): Promise<Company[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<Company | null> {
    return this.repository.findOneBy({ id });
  }

  findOneBySecretKey(secretKey: string): Promise<Company | null> {
    return this.repository.findOneBy({ secretKey });
  }

  async save(
    company: Pick<Company, 'name' | 'secretKey' | 'tax' | 'isActive'>,
  ): Promise<Company> {
    return this.repository.save(company);
  }
}
