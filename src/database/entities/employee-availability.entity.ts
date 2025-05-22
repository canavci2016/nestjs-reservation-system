import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserEmployeeAppointment } from './user-employee-appointment.entity';
import { Employee } from './employee.entity';

@Entity()
export class EmployeeAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  companyId: string;

  @Column({ type: 'date' })
  availableDate: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'numeric', default: 1 })
  capacity: number;

  @ManyToOne(() => Employee, (model) => model.availabilities)
  employee: Employee;

  @OneToMany(
    (type) => UserEmployeeAppointment,
    (model) => model.employeeAvailability,
  )
  appointments: UserEmployeeAppointment[];

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
