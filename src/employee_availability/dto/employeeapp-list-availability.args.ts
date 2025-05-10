import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class EmployeeAppListAvailabilityArgs {

  @Field()
  date: string;
}
