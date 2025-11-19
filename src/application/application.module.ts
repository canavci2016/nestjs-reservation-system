import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [BlogModule, AnnouncementModule, ReportingModule, UserModule],
  exports: [BlogModule, AnnouncementModule, ReportingModule, UserModule],
})
export class ApplicationModule {}