import { ConflictException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) { }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: EmployeeSignUpInput,
  ): Promise<boolean> {
    const isExists = await this.employeeService.findOne({
      userName: payload.userName,
      companyId: company.sub,
    });

    if (isExists) {
      throw new ConflictException('duplicate employee');
    }

    const employee = await this.employeeService.save({
      ...payload,
      companyId: company.sub,
    });
    return Boolean(employee);
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

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.employeeService.deleteById({
      id,
      companyId: company.sub,
    });
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateEmployeeInput,
  ): Promise<boolean> {
    const model = await this.employeeService.updateByIdAndCompany(
      { id, companyId: company.sub },
      payload,
    );
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => [Employee])
  async ClientApp_Employee_list(
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
      isActive: true,
    });
    return models;
  }
}
