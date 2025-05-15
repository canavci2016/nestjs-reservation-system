import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class AdminAppAuthLoginArgs {
  @Field()
  userName: string;

  @Field()
  password: string;
}
