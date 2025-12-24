import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly userService: UserService) {
    this.logger.log('StatisticsService initialized');
  }

  getSummary(): Promise<any> {
    // Placeholder: implement actual statistics aggregation
    return Promise.resolve({});
  }

  async getUserCount(companyId?: string): Promise<number> {
    const count = await this.userService.count({ companyId });
    return Number(count);
  }
}
