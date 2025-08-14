import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyUpdateUserPackageCommonTableInput {
  @Field({ description: 'user package quota', nullable: true })
  quota: number;

  @Field({ description: 'user package usage stats', nullable: true })
  numberOfUsage: number;

  @Field({ description: 'user package start date', nullable: true })
  startDate: Date;

  @Field({ description: 'user package end date', nullable: true })
  endDate: Date;
}
