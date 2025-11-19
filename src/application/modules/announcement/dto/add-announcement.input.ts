import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from '../interfaces/file-upload.interface';

@InputType()
export class AddAnnouncementInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  photoUrl: string;

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>;
}
