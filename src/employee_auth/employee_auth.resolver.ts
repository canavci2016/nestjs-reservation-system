import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAuthService } from './employee_auth.service';
import { Employee } from './employee.decorator';
import { EmployeeAuthGuard } from './employee-auth.guard';
import { AuthEmployee } from './models/auth-employee.model';
import { UpdateProfileInput } from './dto/update-profile.input';

@Resolver()
export class EmployeeAuthResolver {
  constructor(private readonly authService: EmployeeAuthService) {}

  @UseGuards(EmployeeAuthGuard)
  @Query(() => AuthEmployee)
  async AdminApp_Employee_profile(
    @Employee() employeeDto: { sub: string },
  ): Promise<AuthEmployee> {
    const user = await this.authService.findUserById(employeeDto.sub);
    const authUserIns = new AuthEmployee();
    authUserIns.id = user.id;
    authUserIns.name = user.name;
    authUserIns.lastName = user.lastName;
    authUserIns.userName = user.userName;
    authUserIns.email = user.email;
    authUserIns.phone = user.phone;

    return authUserIns;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => AuthEmployee)
  async AdminApp_Employee_updateProfile(
    @Employee() employeeDto: { sub: string },
    @Args('payload') payload: UpdateProfileInput,
  ): Promise<AuthEmployee> {
    const res = await this.authService.updateById(employeeDto.sub, payload);
    const user = await this.authService.findUserById(employeeDto.sub);
    const authUserIns = new AuthEmployee();
    authUserIns.id = user.id;
    authUserIns.name = user.name;
    authUserIns.lastName = user.lastName;
    authUserIns.userName = user.userName;
    authUserIns.email = user.email;
    authUserIns.phone = user.phone;
    authUserIns.deviceToken = user.deviceToken;
    return authUserIns;
  }
}
