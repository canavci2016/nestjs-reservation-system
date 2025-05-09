import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';
import { Company } from 'src/company_auth/company_auth.decorator';
import { User } from 'src/auth/auth.decorator';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { AddAvailabilityInput } from './dto/add-availability.input';
import { Employee } from 'src/employee_auth/employee.decorator';
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';

@Resolver()
export class EmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
  ) {}

  @UseGuards(CompanyAuthGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Query(() => [EmployeeAvailability])
  async Employee_Availability_list(
    @Company() company: { id: string },
    @User() user: { sub: string },
    @Args() args: ListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots(args);
    return result;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async EmployeeApp_Employee_Availability_add(
    @Company() company: { id: string },
    @Employee() employee,
    @Args('payload') payload: AddAvailabilityInput,
  ): Promise<boolean> {
    const data = {
      companyId: company.id,
      ...payload,
    };
    const res = await this.availabilityService.save(data);
    return true;
  }
}
