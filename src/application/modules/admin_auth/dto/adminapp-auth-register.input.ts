import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class AdminAppAuthRegisterInput {
  @Field()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Şirket ismi boş kalamaz ' })
  name: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsEmail({}, { message: 'Geçersiz email formatı ' })
  @Field({ nullable: true })
  email?: string;

  @Field()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı boş kalamaz ' })
  @MinLength(2, { message: 'Kullanıcı adı en az 2 karakter olmalı ' })
  @MaxLength(10, { message: 'Kullanıcı adı en fazla 10 karakter olmalı ' })
  userName: string;

  @Field()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş kalamaz ' })
  @MinLength(2, { message: 'Şifre en az 2 karakter olmalı ' })
  @MaxLength(10, { message: 'Şifre en fazla 10 karakter olmalı ' })
  password: string;
}
