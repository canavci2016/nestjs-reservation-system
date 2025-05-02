import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddBlogInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  photoUrl: string;
}
