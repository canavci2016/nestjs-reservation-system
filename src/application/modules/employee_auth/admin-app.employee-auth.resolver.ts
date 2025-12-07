import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAuthService } from './employee_auth.service';
import { Employee } from './employee.decorator';
import { EmployeeAuthGuard } from './employee-auth.guard';
import { AuthEmployee } from './models/auth-employee.model';
import { UpdateProfileInput } from './dto/update-profile.input';
import { AuthEmployeeDecoratorInterface } from './interfaces/auth-employee-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { AdminAuthRole } from '../admin_auth/admin-auth-role.enum';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';

@Resolver()
export class AdminAppEmployeeAuthResolver {
  constructor(private readonly authService: EmployeeAuthService) { }

  @UseGuards(EmployeeAuthGuard)
  @Query(() => AuthEmployee)
  async AdminApp_Employee_getProfile(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
  ) {
    const employeeService = this.authService.getEmployeeService();

    const employee = await employeeService.findOne({ id: employeeDto.sub });
    return employee;
  }

  @AdminAuth(AdminAuthRole.EMPLOYEE)
  @Mutation(() => Boolean)
  async AdminApp_Employee_updateProfile(
    @Admin() adminDto: AuthAdminDecoratorInterface,
    @Args('payload') payload: UpdateProfileInput,
  ): Promise<boolean> {
    const res = await this.authService.updateById(adminDto.sub, payload);
    return res;
  }
}
