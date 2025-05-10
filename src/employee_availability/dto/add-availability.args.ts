import { ArgsType, Field, InputType } from '@nestjs/graphql';

@InputType()
class AddAvailabilitySingleInput {
  @Field()
  availableDate: string;

  @Field({ description: 'availability start date' })
  startTime: string;

  @Field({ description: 'availability end date' })
  endTime: string;
}

@ArgsType()
export class AddAvailabilityArgs {
  @Field((type) => [AddAvailabilitySingleInput])
  payload: AddAvailabilitySingleInput[];
}
