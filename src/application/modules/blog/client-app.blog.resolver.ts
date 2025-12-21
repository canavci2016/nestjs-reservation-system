import { Resolver, Args, Query } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Blog } from './models/blog.model';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';
import { User } from '../auth/auth.decorator';

@Resolver()
export class ClientAppBlogResolver {
  constructor(private readonly blogService: BlogService) { }

  @UseGuards(AuthGuard)
  @Query(() => [Blog])
  async ClientApp_Blog_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Blog[]> {
    const models = await this.blogService.findAll({
      companyId: authUser.user.companyId,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(AuthGuard)
  @Query(() => Blog)
  async ClientApp_Blog_detail(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('id') id: string,
  ): Promise<Blog> {
    const model = await this.blogService.findOne({
      companyId: authUser.user.companyId,
      id: id,
    });

    if (!model) {
      throw new NotFoundException('blog is absent');
    }

    return model;
  }
}
