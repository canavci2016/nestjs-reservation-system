import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { TokenGuard } from 'src/token/token.guard';
import { Token } from 'src/token/token.decorator';
import { Response } from 'express';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { AdminAuthService } from './admin_auth.service';
import { UserSetPasswordInput } from './dto/user-set-password.input';

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

    const rawContent = await readFile('src/admin_auth/views/set-password.hbs', {
      encoding: 'utf-8',
    });
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
    const admin = await this.adminAuthService.updateById(
      tokenModel.owner_id,
      setPasswordDto,
    );

    const revokeToken = await this.tokenService.updateById(tokenModel.id, {
      revoked: true,
    });
    return res.send('password is updated please close the tab');
  }
}
