import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ConflictException, UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { UserService } from './user.service';
import { UserAddInput } from './dto/user-add.input';
import { User } from './models/user.model';
import { UserUpdateInput } from './dto/user-update.input';
import { TokenService } from 'src/token/token.service';
import * as moment from 'moment';
import { TokenTypes } from 'src/token/token-types.enum';
import { AwsService } from 'src/aws/aws.service';
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';
import { Employee } from 'src/employee_auth/employee.decorator';
import { AuthEmployeeDecoratorInterface } from 'src/employee_auth/interfaces/auth-employee-decorator.interface';
import { PaginationPipe } from 'src/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from 'src/aws/aws-sqs-message-qb';
import { ConfigService } from 'src/config/config.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) { }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_User_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: UserAddInput,
  ): Promise<boolean> {
    const isUserExists = await this.userService.findOne({
      userName: payload.userName,
      companyId: company.sub,
    });

    if (isUserExists) {
      throw new ConflictException('user is already available');
    }

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

    return Boolean(userModel);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [User])
  async AdminApp_Company_User_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<User[]> {
    const models = await this.userService.findAll({
      q,
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(EmployeeAuthGuard)
  @Query(() => [User])
  async AdminApp_Employee_User_list(
    @Employee() employee: AuthEmployeeDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<User[]> {
    const models = await this.userService.findAll({
      q,
      companyId: employee.employee.companyId,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => User)
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

  @UseGuards(EmployeeAuthGuard)
  @Query(() => User)
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
    const user = await this.userService.findOne({ id: userId });

    if (user?.userName != payload.userName) {
      const isUserExists = await this.userService.findOne({
        userName: payload.userName,
        companyId: company.sub,
      });

      if (isUserExists) {
        throw new ConflictException('user is already available');
      }
    }

    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model.affected);
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

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Profile_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const user = await this.userService.findOne({ id: userId });

    if (user?.userName != payload.userName) {
      const isUserExists = await this.userService.findOne({
        userName: payload.userName,
        companyId: company.sub,
      });

      if (isUserExists) {
        throw new ConflictException('user is already available');
      }
    }

    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: company.sub,
      isActive: payload.isActive || true,
    });
    return Boolean(model.affected);
  }
}
