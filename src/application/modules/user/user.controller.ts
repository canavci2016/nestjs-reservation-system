import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { UserSetPasswordInput } from './dto/user-set-password.input';
import { TokenGuard } from '../../../shared/modules/app-token/token.guard';
import { TokenService } from '../../../core/modules/token/services/token.service';
import { Token } from '../../../shared/modules/app-token/token.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) { }

  @UseGuards(TokenGuard)
  @Get('/set-password')
  async getSetPassword(
    @Token() tokenModel: { owner_id: string; content: string },
    @Res() res: Response,
  ) {
    const user = await this.userService.findOne({ id: tokenModel.owner_id });

    const rawContent = await readFile('src/application/modules/user/views/set-password.hbs', {
      encoding: 'utf-8',
    });
    const template = Handlebars.compile(rawContent);
    const content = template({
      fullName: user?.name + ' ' + user?.lastName,
      token: tokenModel.content,
    });

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
    const user = await this.userService.findOne({ id: tokenModel.owner_id });
    if (!user) {
      throw new NotFoundException('user is not found');
    }
    const result = await this.userService.updateById(user.id, {
      password: setPasswordDto.password,
    });
    const revokeToken = await this.tokenService.updateBy(
      { id: tokenModel.id },
      {
        revoked: true,
      },
    );
    return res.send('password is updated please close the tab');
  }
}
