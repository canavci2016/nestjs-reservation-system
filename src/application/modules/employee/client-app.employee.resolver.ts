import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppEmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(CompanyAppGuard)
  @Query(() => [Employee])
  async ClientApp_Employee_list(
    @CompanyApp() company: { id: string },
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Employee[]> {
    const models = await this.employeeService.findAll({
      companyId: company.id,
      pagination: pagination,
      isActive: true,
    });
    return models;
  }
}