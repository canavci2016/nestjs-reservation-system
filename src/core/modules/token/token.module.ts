import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './services/jwt.service';
import { TokenService } from './services/token.service';
import TokenEntity from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ICoreTokenModuleOptions } from './interfaces/token-module.interface';

@Module({})
export class TokenModule {
  static forRoot(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<ICoreTokenModuleOptions> | ICoreTokenModuleOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      imports: [
        ...(options.imports || []),
        JwtModule.registerAsync({
          useFactory: async (...args: any[]) => {
            const clientOptions = await options.useFactory(...args);

            return {
              secret: clientOptions.secret,
              signOptions: {
                expiresIn:
                  clientOptions.jwtExpires.amount +
                  clientOptions.jwtExpires.unit,
              },
            };
          },
          inject: options.inject || [],
          imports: options.imports || [],
        }),
        TypeOrmModule.forFeature([TokenEntity]), //we must get rid of type orm dependencies
      ],
      module: TokenModule,
      providers: [
        {
          provide: 'TOKEN_JWT_SECRET',
          async useFactory(...args: any[]) {
            const data = await options.useFactory(...args);
            return data.secret;
          },
          inject: options.inject || [],
        },
        JwtService,
        TokenService,
      ],
      exports: [JwtModule, JwtService, TokenService],
    };
  }
}
