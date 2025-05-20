import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyUpdateInput {
  @Field({ nullable: true })
  secretKey: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  userName: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
