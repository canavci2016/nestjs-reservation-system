import { Field, ObjectType } from '@nestjs/graphql';
import { UserEmployeeAppointmentAvailability } from './employee-availability.model';
import { UserEmployeeAppointmentUser } from './user.model';
import { UserEmployeeAppointmentEmployee } from './employee.model';

@ObjectType()
export class UserEmployeeAppointment {
  @Field({ description: 'appointment id' })
  id: string;

  @Field({ description: 'appointment status' })
  status: string;

  @Field({ description: 'appointment comment', nullable: true })
  comment: string;

  @Field({ description: 'appointment status' })
  createdAt: Date;

  @Field({ description: 'appointment user id' })
  userId: string;

  @Field((type) => UserEmployeeAppointmentAvailability)
  employeeAvailability: UserEmployeeAppointmentAvailability;

  @Field((type) => UserEmployeeAppointmentUser)
  user: Promise<UserEmployeeAppointmentUser>;

  @Field((type) => UserEmployeeAppointmentEmployee)
  employee: UserEmployeeAppointmentEmployee;
}
