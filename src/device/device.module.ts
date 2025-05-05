import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';
import { CompanyModule } from 'src/company/company.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CompanyModule, AuthModule],
  providers: [DeviceService, DeviceResolver],
})
export class DeviceModule {}
