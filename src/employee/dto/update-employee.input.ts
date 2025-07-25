import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  lengthOfOperationInMinute?: number;
}
