import { Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from 'src/company/company.service';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly service: CompanyService) { }

  @Query(() => String)
  Company_signIn(): string {
    return 'Hello World!';
  }
}
