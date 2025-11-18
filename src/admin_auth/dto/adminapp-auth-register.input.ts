import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class AdminAppAuthRegisterInput {
  @Field()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  email?: string;

  @Field()
  @IsString()
  userName: string;

  @Field()
  @IsString()
  password: string;
}
