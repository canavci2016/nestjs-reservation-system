import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { EmployeeService } from './employee.service';
import { Employee } from './models/employee.model';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';
import { User } from '../auth/auth.decorator';

@Resolver()
export class ClientAppEmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) { }

  @UseGuards(AuthGuard)
  @Query(() => [Employee])
  async ClientApp_Employee_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Employee[]> {
    const models = await this.employeeService.findAll({
      companyId: authUser.user.companyId,
      pagination: pagination,
      isActive: true,
    });
    return models;
  }
}