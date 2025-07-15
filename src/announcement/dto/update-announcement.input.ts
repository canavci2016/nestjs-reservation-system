import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from '../interfaces/file-upload.interface';

@InputType()
export class UpdateAnnouncementInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>;
}
