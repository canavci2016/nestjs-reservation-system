import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveUser } from './interfaces/save-user.interface';
import { User } from 'src/database/entities/user.entity';
import * as argon2 from 'argon2';
import { Pagination } from 'src/core/modules/pagination/interfaces/pagination.interface';
import { UserAndCompanyUserPackage } from 'src/database/entities/user-and-company-user-package.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    @InjectRepository(User)
    private userAndCUP: Repository<UserAndCompanyUserPackage>,
  ) {
    console.log('UserService initialized');
  }

  async findAll(
    options: {
      q?: string;
      companyId?: string;
      pagination?: Pagination;
    } | null = null,
  ) {
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    if (options?.q) {
      whereQuery['name'] = Like(`%${options.q}%`);
    }

    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    const alias = 'user';

    const queryBuilder = this.repository.createQueryBuilder(alias);
    queryBuilder
      .where(whereQuery)
      .take(take)
      .skip(skip)
      .addSelect((subQuery) => {
        const tableAlias = 'u_and_c_u_p';
        return subQuery
          .select(`${tableAlias}.id`, 'id')
          .from(UserAndCompanyUserPackage, tableAlias)
          .where(`${tableAlias}.userId = ${alias}.id`)
          .andWhere(`${tableAlias}.startDate <= :date`, { date: new Date() })
          .andWhere(`${tableAlias}.endDate >= :date`, { date: new Date() })
          .andWhere(`${tableAlias}.quota > :quota`, { quota: 0 })
          .andWhere(`${tableAlias}.numberOfUsage < ${tableAlias}.quota`)
          .limit(1);
      }, 'user_activePackageId')
      .orderBy(`${alias}.createdAt`, 'DESC');
    const users: Array<User> = await queryBuilder.getRawMany();

    const updatedUsers = users.map((user) => {
      const newUserObj: User = new User();
      for (const [key, value] of Object.entries(user)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newUserObj[key.replace(`${alias}_`, '')] = value;
      }
      return newUserObj;
    });

    return updatedUsers;
  }

  findOne(payload: Partial<Omit<User, 'company'>>) {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveUser): Promise<User> {
    if (payload.password?.trim()) {
      payload.password = await this.generateHashedPassword(payload.password);
    }

    return this.repository.save(payload);
  }

  async updateById(id: string, payload: Partial<SaveUser>) {
    const payloadMap = new Map(Object.entries(payload));

    if (payloadMap.size > 0) {
      if (payloadMap.get('password')) {
        payloadMap.set(
          'password',
          await this.generateHashedPassword(
            payloadMap.get('password') as string,
          ),
        );
      } else if (payloadMap.has('password')) {
        payloadMap.delete('password');
      }

      return await this.repository
        .createQueryBuilder()
        .update(User)
        .set(Object.fromEntries(payloadMap))
        .where('id = :id', { id })
        .execute();
    }
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

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return argon2.verify(user.password, password);
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
