import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/auth/auth.decorator';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { SetDeviceInput } from './dto/set-device.input';
import { DeviceService } from './device.service';

@Resolver()
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(CompanyAuthGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Mutation(() => Boolean)
  async Device_set(
    @Company() company: { id: string },
    @User() user: { sub: string },
    @Args('payload') payload: SetDeviceInput,
  ): Promise<boolean> {
    const data = {
      token: payload.token,
      companyId: company.id,
      userId: user?.sub || undefined,
    };

    const userRes = await this.deviceService.updateOrInsertByToken(data);

    return true;
  }
}
