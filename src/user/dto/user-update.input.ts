import { InputType, PartialType } from '@nestjs/graphql';
import { UserAddInput } from './user-add.input';

@InputType()
export class UserUpdateInput extends PartialType(UserAddInput) {}
