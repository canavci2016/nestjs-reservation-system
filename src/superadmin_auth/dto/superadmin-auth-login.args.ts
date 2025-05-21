import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SuperAdminAuthLoginArgs {
  @Field()
  userName: string;

  @Field()
  password: string;
}
