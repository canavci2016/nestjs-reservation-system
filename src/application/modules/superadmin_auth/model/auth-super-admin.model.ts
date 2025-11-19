import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthSuperAdmin {
  @Field({ description: 'user name' })
  access_token: string;
}
