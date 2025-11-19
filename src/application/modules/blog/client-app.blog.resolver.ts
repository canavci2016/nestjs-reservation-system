import { Resolver, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Blog } from './models/blog.model';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { CompanyAppGuard } from '../../../company_auth/company_app.guard';
import { CompanyApp } from '../../../company_auth/company_app.decorator';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppBlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(CompanyAppGuard)
  @Query(() => [Blog])
  async ClientApp_Blog_list(
    @CompanyApp() company: { id: string },
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Blog[]> {
    const models = await this.blogService.findAll({
      companyId: company.id,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => Blog)
  async ClientApp_Blog_detail(
    @CompanyApp() company: { id: string },
    @Args('id') id: string,
  ): Promise<Blog> {
    const model = await this.blogService.findOne({
      companyId: company.id,
      id: id,
    });

    if (!model) {
      throw new NotFoundException('blog is absent');
    }

    return model;
  }
}