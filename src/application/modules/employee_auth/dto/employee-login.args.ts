import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class EmployeeLoginArgs {
  @Field()
  userName: string;

  @Field()
  password: string;
}
