import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';
import { AnnouncementService } from './announcement.service';
import { AnnouncementResolver } from './announcementService.resolver';

@Module({
  imports: [CompanyModule],
  providers: [AnnouncementService, AnnouncementResolver],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
