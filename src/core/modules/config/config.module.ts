import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options: {
    folder: string;
    isGlobal?: boolean;
  }): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: ConfigModule,
      providers: [
        ConfigService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [ConfigService],
    };
  }
}
