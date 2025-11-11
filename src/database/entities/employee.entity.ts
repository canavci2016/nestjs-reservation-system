import { Entity, Column, OneToMany } from 'typeorm';
import { EmployeeAvailability } from './employee-availability.entity';
import { Person } from './person.entity';

@Entity()
export class Employee extends Person {
  @Column({ nullable: true })
  photoUrl?: string;

  @OneToMany((type) => EmployeeAvailability, (model) => model.employee)
  availabilities: EmployeeAvailability[];

  @Column({ default: 60, type: 'integer' })
  lengthOfOperationInMinute: number;
}
