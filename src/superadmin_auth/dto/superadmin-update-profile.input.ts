import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SuperAdminUpdateProfileInput {
  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  password?: string;
}
