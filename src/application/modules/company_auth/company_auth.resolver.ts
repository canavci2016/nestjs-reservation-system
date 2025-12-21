import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { Company as CompanyModel } from './models/company.model';
import { CompanyAuthService } from './company_auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';
import { User } from '../auth/auth.decorator';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly authService: CompanyAuthService) { }
  @UseGuards(AuthGuard)
  @Query(() => CompanyModel)
  Company_profile(@User() authUser: AuthUserDecoratorInterface) {
    return this.authService.findById(authUser.user.companyId);
  }
}
