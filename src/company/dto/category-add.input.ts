import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyAddInput {
  @Field()
  secretKey: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
