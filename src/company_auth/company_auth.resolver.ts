import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from 'src/company/company.service';
import { CompanyAuthGuard } from './company_auth.guard';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly service: CompanyService) { }

  @Query(() => String)
  async Company_signIn(): Promise<string> {
    const user = await this.service.findOneByToken('dawda');

    return 'result';
  }


  @UseGuards(CompanyAuthGuard)
  @Query(() => String)
  async Company_profile(): Promise<string> {
    const user = await this.service.findOneByToken('dawda');

    return 'result';
  }
}
