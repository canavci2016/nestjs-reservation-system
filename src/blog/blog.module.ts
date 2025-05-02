import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), CompanyModule],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
