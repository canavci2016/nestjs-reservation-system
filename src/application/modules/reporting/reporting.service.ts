import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reporting } from '../../../database/entities/reporting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Reporting)
    private repository: Repository<Reporting>,
  ) {
    console.log('ReportingService initialized');
  }

  async save(payload: Partial<Reporting>): Promise<Reporting> {
    return this.repository.save(payload);
  }
}
