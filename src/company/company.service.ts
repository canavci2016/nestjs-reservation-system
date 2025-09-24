import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/database/entities/company.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private repository: Repository<Company>,
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

  async save(company: Partial<Company>) {
    const companyObj = await this.findOne({ userName: company.userName });
    if (companyObj) {
      throw new ConflictException(
        `company with username "${company.userName}" already exists`,
      );
    }

    return this.repository.save(company);
  }

  async updateById(id: string, payload: Partial<Company>) {
    if (Object.keys(payload).length > 0) {
      return await this.repository
        .createQueryBuilder()
        .update(Company)
        .set(payload)
        .where('id = :id', { id })
        .execute();
    }

    return this.repository.save(payload);
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
