import { Field, ObjectType } from '@nestjs/graphql';

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
}
