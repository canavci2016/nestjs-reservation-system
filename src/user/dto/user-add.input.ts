import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UserAddInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail({})
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive: boolean;
}
