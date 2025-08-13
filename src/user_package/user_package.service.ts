import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CompanyUserPackage,
  CompanyUserPackageExpiresType,
} from 'src/database/entities/company-user-package.entity';
import { UserAndCompanyUserPackage } from 'src/database/entities/user-and-company-user-package.entity';
import { Pagination } from 'src/pagination/interfaces/pagination.interface';
import { UserService } from 'src/user/user.service';
import { LessThanOrEqual, MoreThan, Raw, Repository } from 'typeorm';
import * as moment from 'moment';

export interface FindAllOptions {
  companyId?: string;
  order?: Record<string, string>;
  pagination?: Pagination;
}

export interface FindAllOptionsForUserAndCompanyPackage extends FindAllOptions {
  userId?: string;
}

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(CompanyUserPackage)
    private repository: Repository<CompanyUserPackage>,
    @InjectRepository(UserAndCompanyUserPackage)
    private userPackagerepository: Repository<UserAndCompanyUserPackage>,
    @InjectRepository(UserAndCompanyUserPackage)
    private userAndCompanyUserPackageRepository: Repository<UserAndCompanyUserPackage>,
    private readonly userService: UserService,
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
    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };
    return this.repository.find(query);
  }

  async findAllForUserAndPackage(
    options: FindAllOptionsForUserAndCompanyPackage | null = null,
  ) {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyUserPackage'] = { companyId: options.companyId };
    }

    if (options?.userId) {
      whereQuery['userId'] = options.userId;
    }

    query['where'] = whereQuery;
    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };

    query['relations'] = {
      companyUserPackage: true,
    };

    const packages = await this.userAndCompanyUserPackageRepository.find(query);

    const updatedPackages = packages.map((pck) => {
      const newPackage = { ...pck, valid: false };
      const now = moment();
      const startDate = moment(pck.startDate);
      const endDate = moment(pck.endDate);

      if (
        now.isSameOrAfter(startDate) &&
        now.isSameOrBefore(endDate) &&
        pck.quota > 0 &&
        pck.numberOfUsage < pck.quota
      ) {
        newPackage.valid = true;
      }

      return newPackage;
    });

    return updatedPackages;
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

  async attachACompanyUserPackageToUser(
    payload: { userId: string } & Pick<CompanyUserPackage, 'id' | 'companyId'>,
  ) {
    const companyUserPackage = await this.findOne({
      id: payload.id,
      companyId: payload.companyId,
    });

    if (!companyUserPackage) {
      throw new NotFoundException('package not found');
    }

    const user = await this.userService.findOne({
      id: payload.userId,
      companyId: payload.companyId,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const res = await this.userAndCompanyUserPackageRepository.save({
      userId: payload.userId,
      companyUserPackageId: payload.id,
      quota: companyUserPackage.quota,
      numberOfUsage: 0,
      startDate: moment().format('YYYY-MM-DD'),
      endDate: this.addCertainTimeToADate(new Date(), companyUserPackage),
    });

    return res;
  }

  async detachACompanyUserPackageFromUser(
    payload: Pick<UserAndCompanyUserPackage, 'id'>,
  ) {
    const result = await this.userAndCompanyUserPackageRepository
      .createQueryBuilder()
      .delete()
      .from(UserAndCompanyUserPackage)
      .where(payload)
      .execute();

    return result;
  }

  addCertainTimeToADate(date: Date, companyUserPackage: CompanyUserPackage) {
    const dateObj = moment(date);
    const amount = companyUserPackage.expiresInNumber;
    if (
      companyUserPackage.expiresInType === CompanyUserPackageExpiresType.YEAR
    ) {
      return dateObj.add(amount, 'years').format('YYYY-MM-DD');
    } else if (
      companyUserPackage.expiresInType === CompanyUserPackageExpiresType.MONTH
    ) {
      return dateObj.add(amount, 'months').format('YYYY-MM-DD');
    } else if (
      companyUserPackage.expiresInType === CompanyUserPackageExpiresType.DAY
    ) {
      return dateObj.add(amount, 'days').format('YYYY-MM-DD');
    }
  }

  async getActivePackagesForUser(userId: string) {
    const activePackages = await this.userPackagerepository.find({
      where: {
        userId: userId,
        startDate: LessThanOrEqual(new Date()),
        endDate: MoreThan(new Date()),
        quota: MoreThan(0),
        numberOfUsage: Raw((alias) => `${alias} < "quota"`),
      },
    });

    return activePackages;
  }

  async updateUserAndCompanyPackage(
    id: string,
    payload: Partial<UserAndCompanyUserPackage>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(UserAndCompanyUserPackage)
      .set(payload)
      .where({ id })
      .execute();
  }

  findOneForUserAndCompanyUserPackagePivot(
    payload: Partial<UserAndCompanyUserPackage>,
  ) {
    return this.userPackagerepository.findOneBy(payload);
  }
}
