import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/database/entities/company.entity';
import { FindManyOptions, Repository } from 'typeorm';
import * as argon2 from 'argon2';

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

    if (company.password?.trim()) {
      company.password = await this.generateHashedPassword(company.password);
    }

    return await this.repository.save(company);
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

  async updateById(id: string, payload: Partial<Company>) {
    if (Object.keys(payload).length > 0) {
      if (payload.password?.trim()) {
        payload.password = await this.generateHashedPassword(payload.password);
      }

      return this.repository
        .createQueryBuilder()
        .update(Company)
        .set(payload)
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
