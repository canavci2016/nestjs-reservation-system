import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/category-add.input';
import { CompanyUpdateInput } from './dto/category-update.input';
import { SuperAdminCompany } from './models/super-admin-company.model';

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

  @Mutation(() => Boolean)
  async SuperAdmin_Company_update(
    @Args('id') id: string,
    @Args('payload') payload: CompanyUpdateInput,
  ): Promise<boolean> {
    const company = await this.service.updateById(id, payload);
    return true;
  }

  @Query(() => [SuperAdminCompany])
  async SuperAdmin_Company_list() {
    const companies = await this.service.findAll();
    return companies;
  }

  @Query(() => Boolean)
  async SuperAdmin_Company_delete(@Args('id') id: string) {
    const company = await this.service.deleteById(id);
    return Boolean(company.affected);
  }
}
