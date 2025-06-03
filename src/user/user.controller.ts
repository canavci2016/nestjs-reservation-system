import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenService } from 'src/token/token.service';
import { TokenGuard } from 'src/token/token.guard';
import { Token } from 'src/token/token.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @UseGuards(TokenGuard)
  @Get('/set-password')
  async getSetPassword(
    @Token() tokenModel: { owner_id: string },
  ): Promise<string> {
    const user = await this.userService.findOne({ id: tokenModel.owner_id });
    return 'This action returns all cats';
  }
}
