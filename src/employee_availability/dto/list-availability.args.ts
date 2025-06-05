import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ListAvailabilityArgs {
  @Field()
  employeeId: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}
