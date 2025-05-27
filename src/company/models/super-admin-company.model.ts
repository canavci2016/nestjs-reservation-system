import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuperAdminCompany {
  @Field({ description: 'company unique id' })
  id: string;

  @Field({ description: 'company secret key' })
  secretKey: string;

  @Field({ description: 'company name' })
  name: string;

  @Field({ description: 'company name' })
  userName: string;

  @Field({ description: 'company tax', nullable: true })
  tax?: string;

  @Field({ description: 'company status' })
  isActive?: boolean;

  @Field({
    description: 'determine if a  company enabled user packaging system',
    nullable: true,
  })
  enableUserPackageSystem?: boolean;
}
