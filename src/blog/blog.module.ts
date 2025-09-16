import { Module } from '@nestjs/common';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [CompanyModule],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
