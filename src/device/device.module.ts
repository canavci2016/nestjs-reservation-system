import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), AuthModule],
  providers: [DeviceService, DeviceResolver],
})
export class DeviceModule {}
