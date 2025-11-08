import { Module } from '@nestjs/common';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { CompanyModule } from 'src/company/company.module';
import { FileUploadModule } from 'src/shared/modules/file-upload/file-upload.module';

@Module({
  imports: [CompanyModule, FileUploadModule],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
