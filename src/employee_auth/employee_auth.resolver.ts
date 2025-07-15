import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAuthService } from './employee_auth.service';
import { Employee } from './employee.decorator';
import { EmployeeAuthGuard } from './employee-auth.guard';
import { AuthEmployee } from './models/auth-employee.model';
import { UpdateProfileInput } from './dto/update-profile.input';
import { AuthEmployeeDecoratorInterface } from './interfaces/auth-employee-decorator.interface';

@Resolver()
export class EmployeeAuthResolver {
  constructor(private readonly authService: EmployeeAuthService) {}

  @UseGuards(EmployeeAuthGuard)
  @Query(() => AuthEmployee)
  AdminApp_Employee_getProfile(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
  ): AuthEmployee {
    const authUserIns = new AuthEmployee();
    authUserIns.id = employeeDto.employee.id;
    authUserIns.name = employeeDto.employee.name;
    authUserIns.lastName = employeeDto.employee.lastName;
    authUserIns.userName = employeeDto.employee.userName;
    authUserIns.email = employeeDto.employee.email;
    authUserIns.phone = employeeDto.employee.phone;

    return authUserIns;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_updateProfile(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args('payload') payload: UpdateProfileInput,
  ): Promise<boolean> {
    const res = await this.authService.updateById(employeeDto.sub, payload);
    return res;
  }
}
