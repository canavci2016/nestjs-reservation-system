import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { UserAndCompanyUserPackage } from './models/user-and-company-user-package.model';
import { UserService } from 'src/application/modules/user/user.service';
import { AuthGuard } from 'src/application/modules/auth/auth.guard';
import { AuthUserDecoratorInterface } from 'src/application/modules/auth/interfaces/auth-employee-decorator.interface';
import { User } from 'src/application/modules/auth/auth.decorator';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppUserPackageResolver {
  constructor(
    private readonly packageService: UserPackageService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [UserAndCompanyUserPackage])
  async ClientApp_UserPackage_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const user = await this.userService.findOne({
      id: authUser.sub,
    });

    if (!user) {
      throw new NotFoundException('user isnot found');
    }

    const company = await user.company;

    const models = await this.packageService.findAllForUserAndPackage({
      userId: user.id,
      companyId: company.id,
      pagination: pagination,
    });

    const result = models.map((m) => ({
      ...m,
      startDate: m.startDate.toString(),
      endDate: m.endDate.toString(),
    }));

    return result;
  }
}
