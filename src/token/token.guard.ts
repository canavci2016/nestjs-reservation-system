import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { MoreThan } from 'typeorm/find-options/operator/MoreThan';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { query: { token?: string } } = context
      .switchToHttp()
      .getRequest();
    const token = request.query.token;

    const tokenModel = await this.tokenService.findOne({
      content: token,
      revoked: false,
      expiresAt: MoreThan(new Date()),
    });

    if (!tokenModel) {
      throw new NotFoundException('token is invalid or revoked');
    }

    request['token_model'] = tokenModel;

    return true;
  }
}
