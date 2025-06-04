import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from 'src/validation/match.decorator';

export class UserSetPasswordInput {
  @IsNotEmpty()
  @IsString()
  @Length(4, 10, { message: 'password length must be between 4-10 characters' })
  password: string;

  @Match('password')
  password_confirmation: string;
}
