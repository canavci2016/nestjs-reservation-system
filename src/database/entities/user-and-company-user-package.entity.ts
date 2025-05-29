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
import { User } from './user.entity';
import { CompanyUserPackage } from './company-user-package.entity';

@Entity()
export class UserAndCompanyUserPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne((type) => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  user: User;

  @Column()
  companyUserPackageId: string;

  @ManyToOne((type) => CompanyUserPackage)
  @JoinColumn({ name: 'companyUserPackageId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  companyUserPackage: CompanyUserPackage;

  @Column()
  quota: number;

  @Column({ type: 'int' })
  numberOfUsage: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

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
