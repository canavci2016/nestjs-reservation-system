import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';

@InputType()
export class CompanyAddInput {
  @Field()
  secretKey: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  userName: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  enableUserPackageSystem?: boolean;

  @Field(() => GraphQLUpload, { nullable: true })
  photo: Promise<FileUpload>;
}
