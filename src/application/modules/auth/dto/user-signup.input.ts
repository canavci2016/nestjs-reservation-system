import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserSignUpInput {
  @Field()
  name: string;

  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  email: string;
}
