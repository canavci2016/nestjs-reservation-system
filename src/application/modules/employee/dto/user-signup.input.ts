import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';

@InputType()
export class EmployeeSignUpInput {
  @IsNotEmpty({ message: 'isim alanı boş olamaz' })
  @Field()
  name: string;

  @IsNotEmpty({ message: 'soyisim alanı boş olamaz' })
  @Field()
  lastName: string;

  @IsNotEmpty({ message: 'kullanıcı adı boş olamaz' })
  @Field()
  userName: string;

  @IsNotEmpty({ message: 'şifre boş olamaz' })
  @Field()
  password: string;

  @Field({ nullable: true })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'geçersiz email formatı' })
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  lengthOfOperationInMinute: number;

  @Field(() => GraphQLUpload, { nullable: true })
  photo: Promise<FileUpload>;
}
