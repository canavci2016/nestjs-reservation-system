import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ReportingAddInput {
  @Field()
  title: string;

  @Field()
  description: string;
}
