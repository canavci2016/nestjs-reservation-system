import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async User_login(@Company() company: any): Promise<string> {
    const user = await this.userService.findByUserNameAndPassword({
      userName: 'userService',
      password: 'avci',
    });
    return 'company';
  }
}
