import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: '../..', isGlobal: true })],
})
export class CoreModule {}
