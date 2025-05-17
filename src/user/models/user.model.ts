import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ description: 'user unique id' })
  id: string;

  @Field({ description: 'user unique name' })
  userName: string;

  @Field({ description: 'user name' })
  name: string;

  @Field({ description: 'user last name' })
  lastName: string;

  @Field({ description: 'user phone', nullable: true })
  phone?: string;

  @Field({ description: 'user email', nullable: true })
  email?: string;
}
