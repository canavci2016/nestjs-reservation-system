import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyUserPackage } from 'src/database/entities/company-user-package.entity';
import { Repository } from 'typeorm';

export interface FindAllOptions {
  companyId?: string;
  order?: Record<string, string>;
}

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(CompanyUserPackage)
    private repository: Repository<CompanyUserPackage>,
  ) {
    console.log('UserPackageService initialized');
  }

  findOne(payload: Partial<CompanyUserPackage>) {
    return this.repository.findOneBy(payload);
  }

  findAll(options: FindAllOptions | null = null) {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    query['where'] = whereQuery;
    query['order'] = { createdAt: 'desc' };
    return this.repository.find(query);
  }

  async save(payload: Partial<CompanyUserPackage>) {
    return this.repository.save(payload);
  }

  async deleteById(condition: Pick<CompanyUserPackage, 'id' | 'companyId'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(CompanyUserPackage)
      .where(condition)
      .execute();

    return result;
  }

  async updateById(
    condition: Pick<CompanyUserPackage, 'id' | 'companyId'>,
    payload: Partial<CompanyUserPackage>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(CompanyUserPackage)
      .set(payload)
      .where(condition)
      .execute();
  }
}
