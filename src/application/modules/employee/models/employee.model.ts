import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Employee {
  @Field({ description: 'employee unique id' })
  id: string;

  @Field({ description: 'employee name' })
  name: string;

  @Field({ description: 'employee last name' })
  lastName: string;

  @Field({ description: 'employee nick name' })
  userName: string;

  @Field({ description: 'employee phone', nullable: true })
  phone?: string;

  @Field({ description: 'employee email', nullable: true })
  email?: string;

  @Field({ description: 'employee photo url', nullable: true })
  photoUrl?: string;
}
