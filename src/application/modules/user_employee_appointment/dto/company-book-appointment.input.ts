import { Field, InputType } from '@nestjs/graphql';
import { BookAppointmentInput } from './book-appointment.input';

@InputType()
export class CompanyBookAppointmentInput extends BookAppointmentInput {
  @Field()
  userId: string;
}
