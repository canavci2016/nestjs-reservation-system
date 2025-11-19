import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyAttachUserPackageInput {
  @Field({ description: 'package id' })
  id: string;

  @Field()
  userId: string;
}
