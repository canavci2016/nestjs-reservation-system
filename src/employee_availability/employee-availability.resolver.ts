import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import {
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';
import { CompanyApp } from 'src/company_auth/company_auth.decorator';
import { User } from 'src/auth/auth.decorator';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { Employee } from 'src/employee_auth/employee.decorator';
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';
import { EmployeeService } from 'src/employee/employee.service';
import { AddAvailabilityArgs } from './dto/add-availability.args';
import { EmployeeAppListAvailabilityArgs } from './dto/employeeapp-list-availability.args';

@Resolver()
export class EmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
    private readonly employeeService: EmployeeService,
  ) {}

  @UseGuards(CompanyAppGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Query(() => [EmployeeAvailability])
  async Employee_Availability_list(
    @CompanyApp() company: { id: string },
    @User() user: { sub: string },
    @Args() args: ListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots(args);
    return result;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async EmployeeApp_Employee_Availability_add(
    @Employee() employeeDto: { sub: string },
    @Args() payload: AddAvailabilityArgs,
  ): Promise<boolean> {
    const employee = await this.employeeService.findOne({
      id: employeeDto.sub,
    });

    if (!employee) {
      throw new UnauthorizedException('employee isnt found');
    }

    const data = payload.payload.map((it) => ({
      companyId: employee.companyId,
      employeeId: employee.id,
      ...it,
    }));

    const res = await this.availabilityService.save(data);
    return true;
  }

  @UseGuards(EmployeeAuthGuard)
  @Query(() => [EmployeeAvailability])
  async EmployeeApp_Employee_Availability_list(
    @Employee() employeeDto: { sub: string },
    @Args() args: EmployeeAppListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots({
      employeeId: employeeDto.sub,
      ...args,
    });
    return result;
  }
}
