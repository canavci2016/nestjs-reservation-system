import { InputType, PartialType } from '@nestjs/graphql';
import { AddAnnouncementInput } from './add-announcement.input';

@InputType()
export class UpdateAnnouncementInput extends PartialType(
  AddAnnouncementInput,
) {}
