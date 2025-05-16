import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { UseGuards } from '@nestjs/common';
import { AddBlogInput } from './dto/add-blog.input';
import { Blog } from './models/blog.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';

@Resolver()
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: AddBlogInput,
  ): Promise<boolean> {
    const model = await this.blogService.save({
      ...payload,
      companyId: company.sub,
      isActive: true,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [Blog])
  async AdminApp_Company_Blog_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Blog[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.blogService.findAll({
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
  }
}
