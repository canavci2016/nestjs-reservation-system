import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ConflictException, UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from '../company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from '../company_auth/interfaces/auth-company-decorator.interface';
import { Company } from '../company_auth/company_auth.decorator';
import { UserService } from './user.service';
import { UserUpdateInput } from './dto/user-update.input';

@Resolver()
export class ClientAppUserResolver {
  constructor(private readonly userService: UserService) { }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Profile_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
    });
    return Boolean(model?.affected);
  }
}
