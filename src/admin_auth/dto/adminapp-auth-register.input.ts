import { InputType, PickType } from '@nestjs/graphql';
import { CompanyAddInput } from 'src/company/dto/company-add.input';

@InputType()
export class AdminAppAuthRegisterInput extends PickType(CompanyAddInput, [
  'name',
  'userName',
  'password',
  'email',
] as const) { }
