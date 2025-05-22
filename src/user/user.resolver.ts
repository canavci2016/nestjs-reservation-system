import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { UserService } from './user.service';
import { UserAddInput } from './dto/user-add.input';
import { User } from './models/user.model';
import { UserUpdateInput } from './dto/user-update.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: UserAddInput,
  ): Promise<boolean> {
    const model = await this.userService.save({
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [User])
  async AdminApp_Company_User_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<User[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.userService.findAll({
      q,
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.userService.deleteById({
      id,
      companyId: company.sub,
    });

    return Boolean(model.affected);
  }
}
