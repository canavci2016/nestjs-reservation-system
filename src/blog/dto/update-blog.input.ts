import { InputType, PartialType } from '@nestjs/graphql';
import { AddBlogInput } from './add-blog.input';

@InputType()
export class UpdateBlogInput extends PartialType(AddBlogInput) {}
