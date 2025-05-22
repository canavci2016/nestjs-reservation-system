import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAnnouncementInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  photoUrl?: string;
}
