import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CompanyAddInput } from './company-add.input';

@InputType()
export class CompanySelfUpdateInput extends PartialType(CompanyAddInput) {
  @Field({ nullable: true })
  deviceToken?: string;
}
