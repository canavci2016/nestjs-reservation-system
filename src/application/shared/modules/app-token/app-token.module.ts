import { Module } from '@nestjs/common';
import { AppTokenProvider } from './app-token.provider';
import { TokenModule } from 'src/core/modules/token/token.module';
import { ConfigModule } from 'src/core/modules/config/config.module';
import { ConfigService } from 'src/core/modules/config/config.service';
import { ICoreTokenModuleOptions } from 'src/core/modules/token/interfaces/token-module.interface';

@Module({
  imports: [
    TokenModule.forRoot({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ICoreTokenModuleOptions => {
        return {
          secret: configService.get('APP_KEY') as string,
          jwtExpires: { unit: 'hour', amount: 12 },
        };
      },
    })],
  providers: [AppTokenProvider],
  exports: [TokenModule],
})
export class AppTokenModule { }
