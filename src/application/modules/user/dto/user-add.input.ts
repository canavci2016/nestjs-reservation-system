import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UserAddInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'isim alanı boş olamaz ' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'soyisim alanı boş olamaz ' })
  @Field()
  lastName: string;

  @Field()
  @IsNotEmpty({ message: 'kullanıcı adı alanı boş olamaz ' })
  userName: string;

  @Field()
  @IsNotEmpty({ message: 'şifre alanı boş olamaz ' })
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'geçersiz email formatı' })
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive: boolean;
}
