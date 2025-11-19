import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';

@Module({
  imports: [BlogModule, AnnouncementModule],
  exports: [BlogModule, AnnouncementModule],
})
export class ApplicationModule {}