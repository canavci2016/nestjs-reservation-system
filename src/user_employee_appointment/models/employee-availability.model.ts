import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserEmployeeAppointmentAvailability {
  @Field({ description: 'availability id' })
  id: string;

  @Field({ description: 'appointment date' })
  availableDate: string;

  @Field({ description: 'appointment start time' })
  startTime: string;

  @Field({ description: 'appointment end time' })
  endTime: string;
}
