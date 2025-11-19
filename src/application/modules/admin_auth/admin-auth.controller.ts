import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { AdminAuthService } from './admin_auth.service';
import { UserSetPasswordInput } from './dto/user-set-password.input';
import { TokenGuard } from 'src/shared/modules/app-token/token.guard';
import { TokenService } from 'src/core/modules/token/services/token.service';
import { Token } from 'src/shared/modules/app-token/token.decorator';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly tokenService: TokenService,
  ) { }

  @UseGuards(TokenGuard)
  @Get('/set-password')
  async getSetPassword(
    @Token() tokenModel: { owner_id: string; content: string },
    @Res() res: Response,
  ) {
    const user = await this.adminAuthService.findById(tokenModel.owner_id);

    const rawContent = await readFile(
      'src/application/modules/admin_auth/views/set-password.hbs',
      {
        encoding: 'utf-8',
      },
    );
    const template = Handlebars.compile(rawContent);

    const fullName = user.model.name;

    const content = template({ fullName, token: tokenModel.content });

    return res.send(content);
  }

  @UseGuards(TokenGuard)
  @Post('/set-password')
  async postSetPassword(
    @Token()
    tokenModel: { id: string; owner_id: string; content: string },
    @Body(new ValidationPipe()) setPasswordDto: UserSetPasswordInput,
    @Res() res: Response,
  ) {
    const admin = await this.adminAuthService.updatePassword(
      tokenModel.owner_id,
      setPasswordDto.password,
    );

    const revokeToken = await this.tokenService.updateBy(
      { id: tokenModel.id },
      {
        revoked: true,
      },
    );
    return res.send('password is updated please close the tab');
  }
}
