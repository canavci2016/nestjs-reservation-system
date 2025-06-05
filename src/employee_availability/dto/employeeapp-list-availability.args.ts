import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class EmployeeAppListAvailabilityArgs {
  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}

@ArgsType()
export class AdminAppCompanyEmployeeListAvailabilityArgs extends EmployeeAppListAvailabilityArgs {
  @Field()
  employeeId: string;
}
