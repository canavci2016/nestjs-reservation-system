import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';
import { AnnouncementService } from './announcement.service';
import { ClientAppAnnouncementResolver } from './client-app.announcement.resolver';
import { AdminAppAnnouncementResolver } from './admin-app.announcement.resolver';

@Module({
  imports: [CompanyModule],
  providers: [
    AnnouncementService,
    AdminAppAnnouncementResolver,
    ClientAppAnnouncementResolver,
  ],
  exports: [AnnouncementService],
})
export class AnnouncementModule { }
