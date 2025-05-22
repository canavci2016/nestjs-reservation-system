import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Announcement {
  @Field({ description: 'announcement id' })
  id: string;

  @Field({ description: 'announcement title' })
  title: string;

  @Field({ description: 'announcement description' })
  description: string;

  @Field({ description: 'announcement photoUrl' })
  photoUrl: string;
}
