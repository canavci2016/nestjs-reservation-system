import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ReportingService } from './reporting.service';
import { ReportingAddInput } from './dto/reportin-add.input';

@Resolver()
export class ReportingResolver {
  constructor(private readonly reportingService: ReportingService) { }

  @Mutation(() => Boolean)
  async CLientApp_Reporting_Add(
    @Args('payload') payload: ReportingAddInput,
  ): Promise<boolean> {
    const model = await this.reportingService.save(payload);

    return Boolean(model);
  }
}
