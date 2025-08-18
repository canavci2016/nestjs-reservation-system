import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeAvailability } from './employee-availability.entity';
import { registerEnumType } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserAndCompanyUserPackage } from './user-and-company-user-package.entity';

export enum UserEmployeeAppointmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

registerEnumType(UserEmployeeAppointmentStatus, {
  name: 'UserEmployeeAppointmentStatus',
});

@Entity()
export class UserEmployeeAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeAvailabilityId: string;

  @Column()
  userId: string;

  @Column({ nullable: true, type: 'character varying' })
  userAndCompanyUserPackageId?: string | null;

  @ManyToOne((type) => UserAndCompanyUserPackage)
  @JoinColumn({
    name: 'userAndCompanyUserPackageId',
    referencedColumnName: 'id',
  })
  userAndCompanyUserPackage: Promise<UserAndCompanyUserPackage>;

  @ManyToOne((type) => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  user: Promise<User>;

  @Column({
    type: 'enum',
    enum: UserEmployeeAppointmentStatus,
    default: UserEmployeeAppointmentStatus.PENDING,
  })
  status: UserEmployeeAppointmentStatus;

  @Column({ type: 'numeric', default: 1 })
  capacity: number;

  @ManyToOne(() => EmployeeAvailability, (model) => model.appointments)
  employeeAvailability: Promise<EmployeeAvailability>;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: false })
  notifyUserBeforeEvent: boolean;

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
