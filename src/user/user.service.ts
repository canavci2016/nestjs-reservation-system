import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveUser } from './interfaces/save-user.interface';
import { User } from 'src/database/entities/user.entity';
import { FindAllOptions } from './interfaces/find-all-option.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {
    console.log('CompanyService initialized');
  }

  findAll(options: FindAllOptions | null = null) {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
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

  findOne(payload: Partial<User>): Promise<User | null> {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveUser): Promise<User> {
    if (payload.password) {
      payload.password = await this.generateToken(payload.password);
    }

    return this.repository.save(payload);
  }

  async updateById(id: string, payload: Partial<SaveUser>) {
    if (payload.password) {
      payload.password = await this.generateToken(payload.password);
    }

    return await this.repository
      .createQueryBuilder()
      .update(User)
      .set(payload)
      .where('id = :id', { id })
      .execute();
  }

  generateToken(password: string) {
    return bcrypt.hash(password, 10);
  }

  async deleteById(condition: Pick<User, 'id' | 'companyId'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(User)
      .softDelete()
      .where(condition)
      .execute();

    return result;
  }
}
