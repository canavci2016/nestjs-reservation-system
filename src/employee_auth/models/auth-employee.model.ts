import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthEmployee {
  @Field({ description: 'user unique id' })
  id: string;

  @Field({ description: 'user name' })
  name: string;

  @Field({ description: 'user last name' })
  lastName: string;

  @Field({ description: 'user nick name' })
  userName: string;

  @Field({ description: 'user phone', nullable: true })
  phone?: string;

  @Field({ description: 'user email', nullable: true })
  email?: string;

  @Field({ description: 'user device token', nullable: true })
  deviceToken?: string;

  @Field({ description: 'user device token', nullable: true })
  lengthOfOperationInMinute?: number;
}
