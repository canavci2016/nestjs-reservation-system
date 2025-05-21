import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SuperAdminAuthService } from './superadmin_auth.service';
import { AuthSuperAdmin } from './model/auth-super-admin.model';
import { SuperAdmin } from './superadmin_auth.decorator';
import { SuperAdminAuthLoginArgs } from './dto/superadmin-auth-login.args';

@Resolver()
export class SuperadminAuthResolver {
  constructor(private readonly authService: SuperAdminAuthService) {}

  @Mutation(() => AuthSuperAdmin)
  async SuperAdmin_Auth_login(
    @SuperAdmin() admin: any,
    @Args() loginArgs: SuperAdminAuthLoginArgs,
  ): Promise<AuthSuperAdmin> {
    const model = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
    });

    return model;
  }
}
