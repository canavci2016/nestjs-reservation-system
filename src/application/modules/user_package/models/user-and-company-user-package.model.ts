import { Field, ObjectType } from '@nestjs/graphql';
import { CompanyUserPackage } from './company-user-package.model';

@ObjectType()
export class UserAndCompanyUserPackage {
  @Field({ description: 'user package unique id' })
  id: string;

  @Field({ description: 'user package user id ' })
  userId: string;

  @Field({ description: 'user package id' })
  companyUserPackageId: string;

  @Field({ description: 'user package quota' })
  quota: number;

  @Field({ description: 'user package usage stats' })
  numberOfUsage: number;

  @Field({ description: 'user package start date' })
  startDate: string;

  @Field({ description: 'user package end date' })
  endDate: string;

  @Field((type) => CompanyUserPackage)
  companyUserPackage: CompanyUserPackage;

  @Field({ description: 'ensure it is still valid' })
  valid: boolean;
}
