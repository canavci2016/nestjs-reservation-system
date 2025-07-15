import { Field, InputType } from '@nestjs/graphql';
import { FileUpload } from '../interfaces/file-upload.interface';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class UpdateBlogInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  photo: Promise<FileUpload>;
}
