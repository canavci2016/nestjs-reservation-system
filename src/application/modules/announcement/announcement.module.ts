import { Module } from '@nestjs/common';
import { CompanyModule } from '../company/company.module';
import { AnnouncementService } from './announcement.service';
import { ClientAppAnnouncementResolver } from './client-app.announcement.resolver';
import { AdminAppAnnouncementResolver } from './admin-app.announcement.resolver';
import { FileUploadModule } from '../../../shared/modules/file-upload/file-upload.module';

@Module({
  imports: [CompanyModule, FileUploadModule],
  providers: [
    AnnouncementService,
    AdminAppAnnouncementResolver,
    ClientAppAnnouncementResolver,
  ],
  exports: [AnnouncementService],
})
export class AnnouncementModule { }
