import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtService } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d' },
    }),
  ],
  providers: [TokenService, JwtService],
  exports: [TokenService, JwtService],
})
export class TokenModule {}
