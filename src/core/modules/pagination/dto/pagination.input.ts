import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field()
  number: number;

  @Field()
  length: number;
}
