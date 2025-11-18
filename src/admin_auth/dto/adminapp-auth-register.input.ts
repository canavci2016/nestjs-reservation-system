import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AdminAppAuthRegisterInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Şirket ismi boş kalamaz : name' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçersiz email formatı : email' })
  @Field({ nullable: true })
  email?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı boş kalamaz : userName' })
  userName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş kalamaz : password' })
  password: string;
}
