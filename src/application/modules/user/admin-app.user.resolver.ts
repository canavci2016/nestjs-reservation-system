import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { CompanyAuthGuard } from '../company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from '../company_auth/interfaces/auth-company-decorator.interface';
import { Company } from '../company_auth/company_auth.decorator';
import { UserService } from './user.service';
import { UserAddInput } from './dto/user-add.input';
import { UserResponseDto } from './dto/user-response.dto';
import { UserUpdateInput } from './dto/user-update.input';
import * as moment from 'moment';
import { AwsService } from '../../../core/modules/aws/aws.service';
import { EmployeeAuthGuard } from '../employee_auth/employee-auth.guard';
import { Employee } from '../employee_auth/employee.decorator';
import { AuthEmployeeDecoratorInterface } from '../employee_auth/interfaces/auth-employee-decorator.interface';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from '../../../core/modules/aws/aws-sqs-message-qb';
import { ConfigService } from '../../../core/modules/config/config.service';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { TokenService } from '../../../core/modules/token/services/token.service';
import { TokenTypes } from '../../../shared/modules/app-token/token-types.enum';

@Resolver()
export class AdminAppUserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) { }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => UserResponseDto)
  async AdminApp_Company_User_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: UserAddInput,
  ): Promise<UserResponseDto> {
    const userModel = await this.userService.save({
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    const token = await this.tokenService.save({
      owner_type: 'user',
      owner_id: userModel.id,
      action: TokenTypes.SET_PASSWORD,
      expiresAt: moment().add(2, 'days').toDate(),
    });

    const appUrl = this.configService.get('APP_URL');
    const setPasswordUrl = `${appUrl}/user/set-password?token=${token.content}`;

    if (userModel.email) {
      const attributes = new AwsSqsMessageQueryBuilder()
        .setStr('action', 'CLIENTAPP_CREATE_ACCOUNT')
        .setStr('name', userModel.name)
        .setStr('lastName', userModel.lastName)
        .setStr('passwordChangeUrl', setPasswordUrl)
        .setStr('email', userModel.email);

      if (userModel.phone) {
        attributes.setStr('phone', userModel.phone);
      }
      const response = await this.awsService.pushIntoQueue(attributes.getObj());
    }

    return userModel;
  }

  //TODO: remove this use AdminApp_User_list
  @UseGuards(CompanyAuthGuard)
  @Query(() => [UserResponseDto])
  async AdminApp_Company_User_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserResponseDto[]> {
    const models = await this.userService.findAll({
      q,
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  //TODO: remove this use AdminApp_User_list
  @UseGuards(EmployeeAuthGuard)
  @Query(() => [UserResponseDto])
  async AdminApp_Employee_User_list(
    @Employee() employee: AuthEmployeeDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserResponseDto[]> {
    const models = await this.userService.findAll({
      q,
      companyId: employee.employee.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth()
  @Query(() => [UserResponseDto])
  async AdminApp_User_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserResponseDto[]> {
    const models = await this.userService.findAll({
      q,
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth()
  @Query(() => Number)
  async AdminApp_User_Count(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
  ): Promise<number> {
    const count = await this.userService.count({
      q,
      companyId: admin.companyId,
    });
    return count;
  }

  @AdminAuth()
  @Query(() => UserResponseDto)
  async AdminApp_User_detail(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ) {
    const model = await this.userService.findOne({
      companyId: admin.companyId,
      id: id,
    });
    return model;
  }

  //TODO: remove this use AdminApp_User_detail
  @UseGuards(CompanyAuthGuard)
  @Query(() => UserResponseDto)
  async AdminApp_Company_User_detail(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id', { nullable: true }) id: string,
  ) {
    const model = await this.userService.findOne({
      companyId: company.sub,
      id: id,
    });
    return model;
  }

  //TODO: remove this use AdminApp_User_detail
  @UseGuards(EmployeeAuthGuard)
  @Query(() => UserResponseDto)
  async AdminApp_Employee_User_detail(
    @Employee() employee: AuthEmployeeDecoratorInterface,
    @Args('id', { nullable: true }) id: string,
  ) {
    const model = await this.userService.findOne({
      companyId: employee.employee.companyId,
      id: id,
    });
    return model;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model?.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.userService.deleteById({
      id,
      companyId: company.sub,
    });

    return Boolean(model.affected);
  }
}
