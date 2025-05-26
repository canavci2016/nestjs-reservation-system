import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';
import { AnnouncementService } from './announcement.service';
import { AnnouncementResolver } from './announcement.resolver';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [CompanyModule, UploadModule],
  providers: [AnnouncementService, AnnouncementResolver],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
