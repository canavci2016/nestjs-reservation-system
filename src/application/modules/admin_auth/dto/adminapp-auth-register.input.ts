import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AdminAppAuthRegisterInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Şirket ismi boş kalamaz ' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçersiz email formatı ' })
  @Field({ nullable: true })
  email?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı boş kalamaz ' })
  userName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Şifre boş kalamaz ' })
  password: string;
}
