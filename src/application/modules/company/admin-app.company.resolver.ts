import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { CompanySelfUpdateInput } from './dto/company-self-update.input';
import { Company } from 'src/application/modules/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/application/modules/company_auth/interfaces/auth-company-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { AdminAuthRole } from '../admin_auth/admin-auth-role.enum';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';

@Resolver()
export class AdminAppCompanyResolver {
  constructor(private readonly service: CompanyService) { }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_updateProfile(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload') payload: CompanySelfUpdateInput,
  ): Promise<boolean> {
    const res = await this.service.updateById(admin.companyId, payload);
    return true;
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Query(() => SuperAdminCompany)
  AdminApp_Company_getProfile(@Admin() admin: AuthAdminDecoratorInterface) {
    return admin.company?.company;
  }
}
