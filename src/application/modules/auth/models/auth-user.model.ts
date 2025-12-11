import { Field, ObjectType } from '@nestjs/graphql';
import { SuperAdminCompany } from '../../company/models/super-admin-company.model';

@ObjectType()
export class AuthUser {
  @Field({ description: 'user unique id' })
  id: string;

  @Field({ description: 'user name' })
  name: string;

  @Field({ description: 'user last name' })
  lastName: string;

  @Field({ description: 'user phone', nullable: true })
  phone?: string;

  @Field({ description: 'user email', nullable: true })
  email?: string;

  @Field(() => SuperAdminCompany, {
    description: 'user company',
    nullable: true,
  })
  company?: SuperAdminCompany;
}
