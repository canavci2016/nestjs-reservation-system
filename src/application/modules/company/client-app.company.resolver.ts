import { Query, Resolver } from '@nestjs/graphql';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.decorator';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';
import { CompanyService } from './company.service';

@Resolver()
export class ClientAppCompanyResolver {
  constructor(private readonly companyService: CompanyService) { }

  @UseGuards(AuthGuard)
  @Query(() => SuperAdminCompany)
  ClientApp_Company_detail(@User() authUser: AuthUserDecoratorInterface) {
    return this.companyService.findOne({ id: authUser.user.companyId });
  }
}
