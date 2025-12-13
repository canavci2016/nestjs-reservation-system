import { ArgsType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddAvailabilitySingleInput {
  @Field()
  availableDate: string;

  @Field({ description: 'availability start date' })
  startTime: string;

  @Field({ description: 'availability end date' })
  endTime: string;

  @Field({
    description: 'number of accepted users per session',
    nullable: true,
    defaultValue: 1,
  })
  capacity?: number;
}

@ArgsType()
export class AddAvailabilityArgs {
  @Field((type) => [AddAvailabilitySingleInput])
  payload: AddAvailabilitySingleInput[];
}
