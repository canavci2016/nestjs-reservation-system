import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum UserEmployeeAppointmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity()
export class UserEmployeeAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeAvailabilityId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: UserEmployeeAppointmentStatus,
    default: UserEmployeeAppointmentStatus.PENDING,
  })
  status: UserEmployeeAppointmentStatus;

  @Column({ type: 'numeric', default: 1 })
  capacity: number;

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
