import { ArgsType, Field } from '@nestjs/graphql';
import { UserEmployeeAppointmentStatus } from 'src/database/entities/user-employee-appointment.entity';

@ArgsType()
export class ClientAppSearchAppointmentArgs {
  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field((type) => UserEmployeeAppointmentStatus, { nullable: true })
  status?: UserEmployeeAppointmentStatus;
}
