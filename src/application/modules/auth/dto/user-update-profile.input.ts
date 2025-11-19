import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdateProfileInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  deviceToken: string;
}
