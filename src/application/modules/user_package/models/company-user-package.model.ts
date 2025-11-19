import { Field, ObjectType } from '@nestjs/graphql';
import { CompanyUserPackageExpiresType } from 'src/database/entities/company-user-package.entity';

@ObjectType()
export class CompanyUserPackage {
  @Field({ description: 'user package unique id' })
  id: string;

  @Field({ description: 'user package  name' })
  name: string;

  @Field({ description: 'user package usage limit' })
  quota: number;

  @Field({ description: 'user package expires number' })
  expiresInNumber?: number;

  @Field((type) => CompanyUserPackageExpiresType, {
    description: 'user package expires type',
  })
  expiresInType?: CompanyUserPackageExpiresType;

  @Field({ description: 'user package status' })
  isActive: boolean;
}
