import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { AddAvailabilitySingleInput } from './add-availability.args';

@InputType()
export class AddEmployeeAvailabilitySingleInput extends AddAvailabilitySingleInput {
  @Field()
  employeeId: string;
}

@ArgsType()
export class AddEmployeeAvailabilityArgs {
  @Field((type) => [AddEmployeeAvailabilitySingleInput])
  payload: AddEmployeeAvailabilitySingleInput[];
}
