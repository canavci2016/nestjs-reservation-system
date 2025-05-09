import { Field, ObjectType } from '@nestjs/graphql';
import { UserEmployeeAppointmentAvailability } from './employee-availability.model';

@ObjectType()
export class UserEmployeeAppointment {
  @Field({ description: 'appointment id' })
  id: string;

  @Field({ description: 'appointment status' })
  status: string;

  @Field((type) => UserEmployeeAppointmentAvailability)
  employeeAvailability: UserEmployeeAppointmentAvailability;
}
