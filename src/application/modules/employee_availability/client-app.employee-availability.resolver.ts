import { Args, Query, Resolver } from '@nestjs/graphql';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { UseGuards } from '@nestjs/common';
import { ListAvailabilityArgs } from './dto/list-availability.args';
import { EmployeeAvailability } from './models/employee-availability.model';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.decorator';

@Resolver()
export class ClientAppEmployeeAvailabilityResolver {
  constructor(
    private readonly availabilityService: EmployeeAvailabilityService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [EmployeeAvailability])
  async ClientApp_Employee_Availability_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args() args: ListAvailabilityArgs,
  ): Promise<EmployeeAvailability[]> {
    const result = await this.availabilityService.getAvailableTimeSlots(args);
    return result;
  }
}
