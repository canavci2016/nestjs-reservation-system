import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(
    @Inject('TOKEN_JWT_SECRET') private readonly secret: string,
    private readonly jwtService: NestJwtService,
  ) { }
  async getToken(
    payload: Record<any, any>,
    options: { expiresIn?: string } = {},
  ) {
    return this.jwtService.signAsync(payload, {
      secret: this.secret,
      ...options,
    });
  }

  async decodeToken<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token, { secret: this.secret });
  }
}
