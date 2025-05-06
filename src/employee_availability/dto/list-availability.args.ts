import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ListAvailabilityArgs {
  @Field()
  employeeId: string;

  @Field()
  date: string;
}
