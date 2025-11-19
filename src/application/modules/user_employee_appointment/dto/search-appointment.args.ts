import { ArgsType, Field } from '@nestjs/graphql';
import { UserEmployeeAppointmentStatus } from 'src/database/entities/user-employee-appointment.entity';

@ArgsType()
export class SearchAppointmentArgs {
  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field((type) => UserEmployeeAppointmentStatus, { nullable: true })
  status?: UserEmployeeAppointmentStatus;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  employeeId?: string;
}
