import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reporting } from '../../../database/entities/reporting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Reporting)
    private repository: Repository<Reporting>,
  ) {
    this.logger.log('ReportingService initialized');
  }

  async save(payload: Partial<Reporting>): Promise<Reporting> {
    return this.repository.save(payload);
  }
}
