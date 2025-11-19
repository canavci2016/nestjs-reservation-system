import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmployeeAvailabilityAppointmentUser {
  @Field({ description: 'appointment unique id' })
  id: string;

  @Field({ description: 'appointment users name' })
  name: string;

  @Field({ description: 'appointment users last name' })
  lastName: string;

  @Field({ description: 'appointment users email', nullable: true })
  email?: string;

  @Field({ description: 'appointment users phone', nullable: true })
  phone?: string;
}
