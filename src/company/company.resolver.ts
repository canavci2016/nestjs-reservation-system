import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/category-add.input';

@Resolver()
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  @Mutation(() => Boolean)
  async SuperAdmin_Company_add(
    @Args('payload') payload: CompanyAddInput,
  ): Promise<boolean> {
    const company = await this.service.save(payload);
    return true;
  }
}
