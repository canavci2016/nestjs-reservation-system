import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CompanyModule } from '../company/company.module';
import { FileUploadModule } from '../../../shared/modules/file-upload/file-upload.module';
import { AdminAppBlogResolver } from './admin-app.blog.resolver';
import { ClientAppBlogResolver } from './client-app.blog.resolver';

@Module({
  imports: [CompanyModule, FileUploadModule],
  providers: [BlogService, AdminAppBlogResolver, ClientAppBlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
