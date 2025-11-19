import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { UseGuards } from '@nestjs/common';
import { AddBlogInput } from './dto/add-blog.input';
import { Blog } from './models/blog.model';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { CompanyAuthGuard } from '../../../company_auth/company_auth.guard';
import { Company } from '../../../company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from '../../../company_auth/interfaces/auth-company-decorator.interface';
import { UpdateBlogInput } from './dto/update-blog.input';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';

@Resolver()
export class AdminAppBlogResolver {
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
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Blog[]> {
    const models = await this.blogService.findAll({
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.blogService.deleteById({
      id,
      companyId: company.sub,
    });
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateBlogInput,
  ): Promise<boolean> {
    const model = await this.blogService.updateById(
      { id, companyId: company.sub },
      {
        ...payload,
        isActive: true,
        companyId: company.sub,
      },
    );
    return Boolean(model.affected);
  }
}