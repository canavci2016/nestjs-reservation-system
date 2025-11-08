import { Args, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { UseGuards } from '@nestjs/common';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { EmployeeService } from 'src/employee/employee.service';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';

@Resolver()
export class ClientAppEmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
    private readonly employeeService: EmployeeService,
  ) {
    console.log('ClientAppEmployeeAvailabilityResolver initialized');
  }

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