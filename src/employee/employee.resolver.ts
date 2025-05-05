import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { EmployeeService } from './employee.service';
import { EmployeeSignUpInput } from './dto/user-signup.input';

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
}
