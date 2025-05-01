import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { UserLoginArgs } from './dto/user-login.args';

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async User_login(
    @Company() company: any,
    @Args() loginArgs: UserLoginArgs,
  ): Promise<string> {
    const user = await this.userService.findByUserNameAndPassword(loginArgs);
    return 'company';
  }
}
