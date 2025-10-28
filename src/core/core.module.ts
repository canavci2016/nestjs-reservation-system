import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { AwsModule } from './modules/aws/aws.module';
import { TokenModule } from './modules/token/token.module';
import { ConfigService } from './modules/config/config.service';
import { ICoreTokenModuleOptions } from './modules/token/interfaces/token-module.interface';

@Module({
  imports: [
    ConfigModule.register({ folder: '../..', isGlobal: true }),
    AwsModule,
    TokenModule.forRoot({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ICoreTokenModuleOptions => {
        return {
          secret: configService.get('APP_KEY') as string,
          jwtExpires: { unit: 'hour', amount: 12 },
        };
      },
    }),
  ],
})
export class CoreModule { }
