import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CompanyLoginArgs {
  @Field()
  userName: string;

  @Field()
  password: string;
}
