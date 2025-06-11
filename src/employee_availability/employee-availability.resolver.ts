import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';
import { User } from 'src/auth/auth.decorator';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { Employee } from 'src/employee_auth/employee.decorator';
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';
import { EmployeeService } from 'src/employee/employee.service';
import { AddAvailabilityArgs } from './dto/add-availability.args';
import {
  AdminAppCompanyEmployeeListAvailabilityArgs,
  EmployeeAppListAvailabilityArgs,
} from './dto/employeeapp-list-availability.args';
import { AuthEmployeeDecoratorInterface } from 'src/employee_auth/interfaces/auth-employee-decorator.interface';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { AddEmployeeAvailabilityArgs } from './dto/add-employee-availability.args';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver()
export class EmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
    private readonly employeeService: EmployeeService,
  ) { }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Availability_add(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args() payload: AddAvailabilityArgs,
  ): Promise<boolean> {
    const employee = employeeDto.employee;
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
  async AdminApp_Employee_Availability_list(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args() args: EmployeeAppListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots({
      employeeId: employeeDto.sub,
      ...args,
    });
    return result;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_Availability_add(
    @Company() companyDto: AuthCompanyDecoratorInterface,
    @Args() payload: AddEmployeeAvailabilityArgs,
  ): Promise<boolean> {
    const data = payload.payload.map((it) => ({
      companyId: companyDto.sub,
      ...it,
    }));

    const res = await this.availabilityService.save(data);
    return true;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Availability_delete(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args('id', { description: 'availability id' })
    id: string,
  ): Promise<boolean> {
    const res = await this.availabilityService.deleteBy({ id: id });
    return Boolean(res.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [EmployeeAvailability])
  async AdminApp_Company_Employee_Availability_list(
    @Company() companyDto: AuthEmployeeDecoratorInterface,
    @Args() args: AdminAppCompanyEmployeeListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots({
      ...args,
    });
    return result;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_Availability_delete(
    @Company() companyDto: AuthCompanyDecoratorInterface,
    @Args('id', { description: 'availability id' }) id: string,
  ): Promise<boolean> {
    const res = await this.availabilityService.deleteBy({ id: id });
    return Boolean(res.affected);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Query(() => [EmployeeAvailability])
  async ClientApp_Employee_Availability_list(
    @User() user: { sub: string },
    @Args() args: ListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots(args);
    return result;
  }
}
