import { Field, InputType } from '@nestjs/graphql';
import { CompanyUserPackageExpiresType } from 'src/database/entities/company-user-package.entity';

@InputType()
export class CompanyAddUserPackageInput {
  @Field()
  name: string;

  @Field()
  quota: number;

  @Field()
  expiresInNumber: number;

  @Field((type) => CompanyUserPackageExpiresType)
  expiresInType?: CompanyUserPackageExpiresType;

  @Field()
  isActive: boolean;
}
