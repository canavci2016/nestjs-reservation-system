import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Announcement {
  @Field({ description: 'blog title' })
  title: string;

  @Field({ description: 'blog description' })
  description: string;

  @Field({ description: 'blog photoUrl' })
  photoUrl: string;
}
