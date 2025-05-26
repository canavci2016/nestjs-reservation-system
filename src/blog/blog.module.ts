import { Module } from '@nestjs/common';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { CompanyModule } from 'src/company/company.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [CompanyModule, UploadModule],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
