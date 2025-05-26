import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AdminAuthService } from './admin_auth.service';
import { AdminAppAuthLoginArgs } from './dto/adminapp-auth-login.args';
import { AuthAdmin } from './model/auth-admin.model';

@Resolver()
export class AdminAuthResolver {
  constructor(private readonly authService: AdminAuthService) {}

  @Mutation(() => AuthAdmin)
  async AdminApp_Auth_login(
    @Args() loginArgs: AdminAppAuthLoginArgs,
  ): Promise<AuthAdmin> {
    const model = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
    });

    return model;
  }
}
