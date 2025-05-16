import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/database/entities/company.entity';
import { Repository } from 'typeorm';

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

  findOne(payload: Partial<Company>): Promise<Company | null> {
    return this.repository.findOneBy(payload);
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
