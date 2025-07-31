import { Field, ObjectType } from '@nestjs/graphql';
import { EmployeeAvailabilityAppointmentUser } from './employee-availability-appointment-user.model';

@ObjectType()
export class EmployeeAvailabilityAppointment {
  @Field({ description: 'appointment unique id' })
  id: string;

  @Field({ description: 'appointment status' })
  status: string;

  @Field({ description: 'appointment employeeAvailabilityId' })
  employeeAvailabilityId: string;

  @Field({ description: 'availability created date' })
  createdAt: Date;

  @Field((type) => EmployeeAvailabilityAppointmentUser, {
    description: 'user package expires type',
  })
  user: EmployeeAvailabilityAppointmentUser;
}
