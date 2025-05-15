import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { UseGuards } from '@nestjs/common';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AddBlogInput } from './dto/add-blog.input';
import { Blog } from './models/blog.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';

@Resolver()
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(CompanyAppGuard)
  @Mutation(() => Boolean)
  async Blog_add(
    @Company() company: { id: string },
    @Args('payload') payload: AddBlogInput,
  ): Promise<boolean> {
    const model = await this.blogService.save({
      ...payload,
      companyId: company.id,
      isActive: true,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => [Blog])
  async Blog_list(
    @Company() company: { id: string },
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Blog[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.blogService.findAll({
      companyId: company.id,
      pagination: paginationObj,
    });
    return models;
  }
}
