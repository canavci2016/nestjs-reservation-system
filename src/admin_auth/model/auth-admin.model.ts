import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthAdmin {
  @Field({ description: 'user name' })
  access_token: string;

  @Field({ description: 'user last name' })
  role: string;
}
