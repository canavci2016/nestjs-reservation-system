import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/category-add.input';

@Resolver()
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  @Mutation(() => Boolean)
  Company_add(@Args('payload') payload: CompanyAddInput): boolean {
    return true;
  }
}
