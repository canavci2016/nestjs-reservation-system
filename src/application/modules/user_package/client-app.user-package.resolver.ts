import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { UserAndCompanyUserPackage } from './models/user-and-company-user-package.model';
import { AuthGuard } from 'src/application/modules/auth/auth.guard';
import { AuthUserDecoratorInterface } from 'src/application/modules/auth/interfaces/auth-employee-decorator.interface';
import { User } from 'src/application/modules/auth/auth.decorator';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppUserPackageResolver {
  constructor(private readonly packageService: UserPackageService) {}

  @UseGuards(AuthGuard)
  @Query(() => [UserAndCompanyUserPackage])
  async ClientApp_UserPackage_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const models = await this.packageService.findAllForUserAndPackage({
      userId: authUser.user.id,
      companyId: authUser.user.companyId,
      pagination: pagination,
    });
    return models;
  }
}
