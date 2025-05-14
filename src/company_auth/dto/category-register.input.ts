import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyRegisterInput {
  @Field()
  secretKey: string;

  @Field()
  name: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
