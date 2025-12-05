import { ConflictException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { CompanyService } from 'src/application/modules/company/company.service';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { Admin } from 'src/application/modules/admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from 'src/application/modules/admin_auth/interfaces/auth-admin-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { AdminAuthRole } from '../admin_auth/admin-auth-role.enum';

@Resolver()
export class AdminAppEmployeeResolver {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly companyService: CompanyService,
  ) { }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_add(
    @Admin() admin: AuthAdminDecoratorInterface,
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
      companyId: admin.companyId,
    });
    return Boolean(employee);
  }

  //TODO: remove this use AdminApp_Employee_list
  @AdminAuth()
  @Query(() => [Employee])
  async AdminApp_Company_Employee_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Employee[]> {
    const models = await this.employeeService.findAll({
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  //TODO: remove this use AdminApp_Employee_list
  @AdminAuth(AdminAuthRole.EMPLOYEE)
  @Query(() => [Employee])
  AdminApp_Employee_Employee_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Employee[] {
    const models = admin.employee?.employee ? [admin.employee.employee] : [];
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
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_delete(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.employeeService.deleteById({
      id,
      companyId: admin.companyId,
    });
    return Boolean(model.affected);
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Employee_update(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateEmployeeInput,
  ): Promise<boolean> {
    const model = await this.employeeService.updateByIdAndCompany(
      { id, companyId: admin.companyId },
      payload,
    );
    return Boolean(model.affected);
  }
}
