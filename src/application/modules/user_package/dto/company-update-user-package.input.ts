import { Field, InputType } from '@nestjs/graphql';
import { CompanyUserPackageExpiresType } from 'src/database/entities/company-user-package.entity';

@InputType()
export class CompanyUpdateUserPackageInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  quota: number;

  @Field({ nullable: true })
  expiresInNumber: number;

  @Field((type) => CompanyUserPackageExpiresType, { nullable: true })
  expiresInType?: CompanyUserPackageExpiresType;

  @Field({ nullable: true })
  isActive: boolean;
}
