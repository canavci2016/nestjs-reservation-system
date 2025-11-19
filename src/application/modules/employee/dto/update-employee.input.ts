import { InputType, PartialType } from '@nestjs/graphql';
import { EmployeeSignUpInput } from './user-signup.input';

@InputType()
export class UpdateEmployeeInput extends PartialType(EmployeeSignUpInput) {}
