import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';

@InputType()
export class EmployeeSignUpInput {
  @Field()
  name: string;

  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  lengthOfOperationInMinute: number;

  @Field(() => GraphQLUpload, { nullable: true })
  photo: Promise<FileUpload>;
}
