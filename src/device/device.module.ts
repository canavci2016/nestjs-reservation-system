import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';

@Module({
  providers: [DeviceService, DeviceResolver],
})
export class DeviceModule {}
