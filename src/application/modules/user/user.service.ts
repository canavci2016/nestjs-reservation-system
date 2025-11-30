import { ConflictException, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveUser } from './interfaces/save-user.interface';
import { User } from '../../../database/entities/user.entity';
import * as argon2 from 'argon2';
import { Pagination } from '../../../core/modules/pagination/interfaces/pagination.interface';
import { UserAndCompanyUserPackage } from '../../../database/entities/user-and-company-user-package.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    private readonly i18n: I18nService,
  ) { }

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

  async count(
    options: {
      q?: string;
      companyId?: string;
    } | null = null,
  ) {
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    if (options?.q) {
      whereQuery['name'] = Like(`%${options.q}%`);
    }

    const alias = 'user';

    const count = await this.repository
      .createQueryBuilder(alias)
      .where(whereQuery)
      .getCount();

    return count;
  }

  findOne(payload: Partial<Omit<User, 'company'>>) {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveUser): Promise<User> {
    await this.checkIfUserNameIsInUse(payload.userName, payload.companyId);

    if (payload.password?.trim()) {
      payload.password = await this.generateHashedPassword(payload.password);
    }

    return this.repository.save(payload);
  }

  async updateById(id: string, payload: Partial<SaveUser>) {
    const payloadMap = new Map(Object.entries(payload));

    if (payloadMap.size > 0) {
      const userName = payloadMap.get('userName') as string | undefined;

      if (userName) {
        const user = await this.findOne({ id: id });

        if (user && user.userName != userName) {
          await this.checkIfUserNameIsInUse(userName, user.companyId);
        }
      }

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

  async checkIfUserNameIsInUse(userName: string, companyId: string) {
    const user = await this.findOne({
      userName: userName,
      companyId: companyId,
    });

    if (user) {
      throw new ConflictException(
        this.i18n.translate('user.EXISTS', {
          args: { value: userName },
        }),
      );
    }
  }
}
