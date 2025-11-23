import { Args, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { UseGuards } from '@nestjs/common';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { CompanyAppGuard } from '../company_auth/company_app.guard';
import { CompanyApp } from '../company_auth/company_app.decorator';

@Resolver()
export class ClientAppEmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
  ) {}

  @UseGuards(CompanyAppGuard)
  @Query(() => [EmployeeAvailability])
  async ClientApp_Employee_Availability_list(
    @CompanyApp() company: { sub: string },
    @Args() args: ListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots(args);
    return result;
  }
}
