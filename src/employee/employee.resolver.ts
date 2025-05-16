import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async AdminApp_Company_Employee_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: EmployeeSignUpInput,
  ): Promise<string> {
    const employee = await this.employeeService.save({
      ...payload,
      companyId: company.sub,
    });
    return employee.id;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [Employee])
  async AdminApp_Company_Employee_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Employee[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.employeeService.findAll({
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
  }
}
