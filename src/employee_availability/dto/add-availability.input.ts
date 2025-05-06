import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddAvailabilityInput {
  @Field()
  employeeId: string;

  @Field()
  availableDate: string;

  @Field({ description: 'availability start date' })
  startTime: string;

  @Field({ description: 'availability end date' })
  endTime: string;
}
