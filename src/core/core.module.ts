import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { AwsModule } from './modules/aws/aws.module';

@Module({
  imports: [
    ConfigModule.register({ folder: '../..', isGlobal: true }),
    AwsModule,
  ],
})
export class CoreModule { }
