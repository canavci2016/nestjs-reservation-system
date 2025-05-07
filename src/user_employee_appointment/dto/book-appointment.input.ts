import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BookAppointmentInput {
  @Field()
  employeeAvailabilityId: string;
  @Field()
  userId: string;
}
