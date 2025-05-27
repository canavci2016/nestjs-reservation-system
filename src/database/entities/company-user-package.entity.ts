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
import { registerEnumType } from '@nestjs/graphql';

export enum CompanyUserPackageExpiresType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}
registerEnumType(CompanyUserPackageExpiresType, {
  name: 'CompanyUserPackageExpiresType',
});

@Entity()
export class CompanyUserPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  quota: number;

  @Column({ type: 'int' })
  expiresInNumber: number;

  @Column({
    type: 'enum',
    enum: CompanyUserPackageExpiresType,
    default: CompanyUserPackageExpiresType.MONTH,
  })
  expiresInType: CompanyUserPackageExpiresType;

  @ManyToOne((type) => Company)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  company: Company;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: true })
  isActive: boolean;

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
