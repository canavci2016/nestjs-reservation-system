import { Field, ObjectType } from '@nestjs/graphql';
import { EmployeeAvailabilityAppointment } from './employee-availability-appointment.model';

@ObjectType()
export class EmployeeAvailability {
  @Field({ description: 'availability unique id' })
  id: string;

  @Field({ description: 'availability date' })
  availableDate: string;

  @Field({ description: 'availability start date' })
  startTime: string;

  @Field({ description: 'availability end date' })
  endTime: string;

  @Field((type) => [EmployeeAvailabilityAppointment], {
    description: 'user package expires type',
  })
  appointments: Array<EmployeeAvailabilityAppointment>;
}
