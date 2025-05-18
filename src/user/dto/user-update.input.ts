import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdateInput {
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

  @Field({ nullable: true })
  isActive: boolean;
}
