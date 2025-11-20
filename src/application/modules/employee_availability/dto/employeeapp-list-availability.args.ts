import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class AdminAppCompanyEmployeeListAvailabilityArgs {
  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field()
  employeeId: string;
}
