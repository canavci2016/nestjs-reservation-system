import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeAvailability } from './employee-availability.entity';
import { Company } from './company.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  companyId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  deviceToken?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @OneToMany((type) => EmployeeAvailability, (model) => model.employee)
  availabilities: EmployeeAvailability[];

  @ManyToOne((type) => Company)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  company: Promise<Company>;

  @Column({ default: 60, type: 'integer' })
  lengthOfOperationInMinute: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
