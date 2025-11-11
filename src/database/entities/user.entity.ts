import { Entity, OneToMany } from 'typeorm';
import { UserAndCompanyUserPackage } from './user-and-company-user-package.entity';
import { Person } from './person.entity';

@Entity()
export class User extends Person {
  @OneToMany((type) => UserAndCompanyUserPackage, (model) => model.user)
  packages: UserAndCompanyUserPackage[];

  activePackageId?: string;
}
