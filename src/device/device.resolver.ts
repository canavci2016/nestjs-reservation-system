import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/auth/auth.decorator';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';

@Resolver()
export class DeviceResolver {
  @UseGuards(CompanyAuthGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Mutation(() => Boolean)
  async Device_set(
    @Company() company: { id: string },
    @User() user: any,
  ): Promise<boolean> {
    const userRes = await Promise.resolve();

    return true;
  }
}
