import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from 'src/core/validation/match.decorator';

@InputType()
export class UserUpdatePasswordInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Length(4, 10, { message: 'password length must be between 4-10 characters' })
  password: string;

  @Field()
  @Match('password')
  passwordConfirmation: string;
}
