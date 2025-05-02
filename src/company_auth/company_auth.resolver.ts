import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from 'src/company/company.service';
import { CompanyAuthGuard } from './company_auth.guard';
import { Company } from './company_auth.decorator';
import { Company as CompanyModel } from './models/company.model';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => String)
  async Company_signIn(): Promise<string> {
    const user = await this.companyService.findOneBySecretKey('dawda');

    return 'result';
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => CompanyModel)
  async Company_profile(
    @Company() company: CompanyModel,
  ): Promise<CompanyModel> {

    return company;
  }
}
