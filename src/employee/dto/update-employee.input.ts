import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  lengthOfOperationInMinute?: number;

  @Field(() => GraphQLUpload, { nullable: true })
  photo: Promise<FileUpload>;
}
