import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyDetachUserPackageInput {
  @Field({ description: 'package id on the intermediate table' })
  id: string;
}
