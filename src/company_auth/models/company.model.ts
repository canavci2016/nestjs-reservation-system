import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field({ description: 'company unique id' })
  id: string;

  @Field({ description: 'company token' })
  token: string;

  @Field({ description: 'company name' })
  name: string;

  @Field({ description: 'company tax', nullable: true })
  tax?: string;

  @Field({ description: 'company status' })
  isActive?: boolean;
}
