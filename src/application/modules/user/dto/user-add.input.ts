import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Max, MaxLength } from 'class-validator';

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
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string'
      ? value?.trim()?.toLowerCase().replace(/\s+/g, '')
      : value,
  )
  @MaxLength(10, { message: 'kullanıcı adı en fazla 10 karakter olabilir' })
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
