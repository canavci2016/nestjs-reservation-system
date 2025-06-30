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
import { Company } from './company.entity';

@Entity()
export class User {
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

  @ManyToOne((type) => Company)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  company: Promise<Company>;

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
