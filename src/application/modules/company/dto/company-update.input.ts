import { InputType, PartialType } from '@nestjs/graphql';
import { CompanyAddInput } from './company-add.input';

@InputType()
export class CompanyUpdateInput extends PartialType(CompanyAddInput) {}
