import { ConflictException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/application/modules/company_auth/company_auth.guard';
import { Company } from 'src/application/modules/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/application/modules/company_auth/interfaces/auth-company-decorator.interface';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { CompanyService } from 'src/application/modules/company/company.service';
import { EmployeeAuthGuard } from 'src/application/modules/employee_auth/employee-auth.guard';
import { Employee as EmployeeDecorator } from 'src/application/modules/employee_auth/employee.decorator';
import { AuthEmployeeDecoratorInterface } from 'src/application/modules/employee_auth/interfaces/auth-employee-decorator.interface';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { Admin } from 'src/application/modules/admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from 'src/application/modules/admin_auth/interfaces/auth-admin-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';

@Resolver()
export class AdminAppEmployeeResolver {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly companyService: CompanyService,
  ) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: EmployeeSignUpInput,
  ): Promise<boolean> {
    const isEmployeePresent = await this.employeeService.findOne({
      userName: payload.userName,
    });

    if (isEmployeePresent) {
      throw new ConflictException('duplicate employee');
    }

    const isCompanyPresent = await this.companyService.findOne({
      userName: payload.userName,
    });

    if (isCompanyPresent) {
      throw new ConflictException('duplicate company');
    }

    const employee = await this.employeeService.save({
      ...payload,
      companyId: company.sub,
    });
    return Boolean(employee);
  }

  //TODO: remove this use AdminApp_Employee_list
  @UseGuards(CompanyAuthGuard)
  @Query(() => [Employee])
  async AdminApp_Company_Employee_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Employee[]> {
    const models = await this.employeeService.findAll({
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  //TODO: remove this use AdminApp_Employee_list
  @UseGuards(EmployeeAuthGuard)
  @Query(() => [Employee])
  AdminApp_Employee_Employee_list(
    @EmployeeDecorator() employee: AuthEmployeeDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Employee[] {
    const models = [employee.employee];
    return models;
  }

  @AdminAuth()
  @Query(() => [Employee])
  async AdminApp_Employee_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Employee[]> {
    if (admin.employee?.employee) {
      return [admin.employee.employee];
    }

    const models = await this.employeeService.findAll({
      companyId: admin?.company?.company?.id,
      pagination: pagination,
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
}
