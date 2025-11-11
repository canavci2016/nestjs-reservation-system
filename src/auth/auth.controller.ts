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
import { UserSetPasswordInput } from './dto/user-set-password.input';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TokenGuard } from 'src/shared/modules/app-token/token.guard';
import { TokenService } from 'src/core/modules/token/services/token.service';
import { Token } from 'src/shared/modules/app-token/token.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) { }

  @UseGuards(TokenGuard)
  @Get('/set-password')
  async getSetPassword(
    @Token() tokenModel: { owner_id: string; content: string },
    @Res() res: Response,
  ) {
    const user = await this.authService.findUserById(tokenModel.owner_id);

    const rawContent = await readFile('src/auth/views/set-password.hbs', {
      encoding: 'utf-8',
    });
    const template = Handlebars.compile(rawContent);

    const fullName = user.name + ' ' + user.lastName;

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
    const user = await this.userService.updateById(tokenModel.owner_id, {
      password: setPasswordDto.password,
    });

    const revokeToken = await this.tokenService.updateBy(
      { id: tokenModel.id },
      {
        revoked: true,
      });
    return res.send('password is updated please close the tab');
  }
}
