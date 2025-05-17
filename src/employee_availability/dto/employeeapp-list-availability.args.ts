import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class EmployeeAppListAvailabilityArgs {
  @Field()
  date: string;
}

@ArgsType()
export class AdminAppCompanyEmployeeListAvailabilityArgs extends EmployeeAppListAvailabilityArgs {
  @Field()
  employeeId: string;
}
