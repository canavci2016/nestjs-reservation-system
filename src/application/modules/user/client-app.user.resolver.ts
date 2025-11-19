import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ConflictException, UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from '../company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from '../company_auth/interfaces/auth-company-decorator.interface';
import { Company } from '../company_auth/company_auth.decorator';
import { UserService } from './user.service';
import { UserUpdateInput } from './dto/user-update.input';

@Resolver()
export class ClientAppUserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Profile_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const user = await this.userService.findOne({ id: userId });

    if (user?.userName != payload.userName) {
      const isUserExists = await this.userService.findOne({
        userName: payload.userName,
        companyId: company.sub,
      });

      if (isUserExists) {
        throw new ConflictException('user is already available');
      }
    }

    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model?.affected);
  }
}