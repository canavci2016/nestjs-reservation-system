import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class UpdateEmployeeAvailabilityInput {
  @Field({ description: 'availability capacity', defaultValue: 1 })
  capacity: number;
}
