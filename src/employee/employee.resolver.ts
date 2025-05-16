import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(CompanyAppGuard)
  @Mutation(() => String)
  async Employee_add(
    @CompanyApp() company: { id: string },
    @Args('payload') payload: EmployeeSignUpInput,
  ): Promise<string> {
    const employee = await this.employeeService.save({
      ...payload,
      companyId: company.id,
    });
    return employee.id;
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => [Employee])
  async Employee_list(
    @CompanyApp() company: { id: string },
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Employee[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.employeeService.findAll({
      companyId: company.id,
      pagination: paginationObj,
    });
    return models;
  }
}
