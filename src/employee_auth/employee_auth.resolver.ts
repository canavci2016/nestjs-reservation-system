import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { EmployeeLoginArgs } from './dto/employee-login.args';
import { EmployeeAuthService } from './employee_auth.service';
import { Employee } from './employee.decorator';
import { EmployeeAuthGuard } from './employee-auth.guard';
import { AuthEmployee } from './models/auth-employee.model';
import { UpdateProfileInput } from './dto/update-profile.input';

@Resolver()
export class EmployeeAuthResolver {
  constructor(private readonly authService: EmployeeAuthService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async EmployeeApp_Employee_login(
    @Company() company: any,
    @Args() loginArgs: EmployeeLoginArgs,
  ): Promise<string> {
    const user = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
      companyId: company!.id as string,
    });

    return user?.access_token;
  }

  @UseGuards(EmployeeAuthGuard)
  @Query(() => AuthEmployee)
  async EmployeeApp_Employee_profile(
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
  async EmployeeApp_Employee_updateProfile(
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
    return authUserIns;
  }
}
