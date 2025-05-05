import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { ExtractAuthUserInterceptor } from 'src/auth/interceptors/extract-auth-user.interceptor';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async Employee_add(
    @Company() company: { id: string },
    @Args('payload') payload: EmployeeSignUpInput,
  ): Promise<string> {
    const employee = await this.employeeService.save({
      ...payload,
      companyId: company.id,
    });
    return employee.id;
  }

  @UseGuards(CompanyAuthGuard)
  @UseInterceptors(ExtractAuthUserInterceptor)
  @Query(() => [Employee])
  async Employee_list(
    @Company() company: { id: string },
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
