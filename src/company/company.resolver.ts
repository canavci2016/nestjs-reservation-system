import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/category-add.input';

@Resolver()
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  @Mutation(() => String)
  async Company_add(
    @Args('payload') payload: CompanyAddInput,
  ): Promise<string> {
    const company = await this.service.save({
      secretKey: payload.secretKey,
      name: payload.name,
      isActive: payload.isActive || true,
    });

    return company.secretKey;
  }
}
