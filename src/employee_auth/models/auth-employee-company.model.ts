import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthEmployeeCompany {
  id: string;

  @Field({ description: 'company name' })
  name: string;

  @Field({ description: 'company name' })
  userName: string;

  @Field({ description: 'company status' })
  isActive?: boolean;

  @Field({
    description: 'determine if a  company enabled user packaging system',
    nullable: true,
  })
  enableUserPackageSystem?: boolean;
}
