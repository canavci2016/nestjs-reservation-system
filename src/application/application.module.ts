import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { ReportingModule } from './modules/reporting/reporting.module';

@Module({
  imports: [BlogModule, AnnouncementModule, ReportingModule],
  exports: [BlogModule, AnnouncementModule, ReportingModule],
})
export class ApplicationModule {}