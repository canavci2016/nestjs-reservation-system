import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddAnnouncementInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  photoUrl: string;
}
