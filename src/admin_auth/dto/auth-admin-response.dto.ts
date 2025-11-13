import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthAdminResponseDto {
  @Field({ description: 'user name' })
  access_token: string;

  @Field({ description: 'user last name' })
  role: string;
}
