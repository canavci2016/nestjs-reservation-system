import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UserLoginArgs {
  @Field()
  userName: string;

  @Field()
  password: string;
}
