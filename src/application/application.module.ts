import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [BlogModule],
  exports: [BlogModule],
})
export class ApplicationModule {}