import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { AddBlogInput } from './dto/add-blog.input';
import { Blog } from './models/blog.model';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { UpdateBlogInput } from './dto/update-blog.input';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';

@Resolver()
export class AdminAppBlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_add(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload') payload: AddBlogInput,
  ): Promise<boolean> {
    const model = await this.blogService.save({
      ...payload,
      companyId: admin.companyId,
      isActive: true,
    });
    return Boolean(model);
  }

  @AdminAuth()
  @Query(() => [Blog])
  async AdminApp_Company_Blog_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Blog[]> {
    const models = await this.blogService.findAll({
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_delete(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.blogService.deleteById({
      id,
      companyId: admin.companyId,
    });
    return Boolean(model.affected);
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Blog_update(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateBlogInput,
  ): Promise<boolean> {
    const model = await this.blogService.updateById(
      { id, companyId: admin.companyId },
      {
        ...payload,
        isActive: true,
        companyId: admin.companyId,
      },
    );
    return Boolean(model.affected);
  }
}