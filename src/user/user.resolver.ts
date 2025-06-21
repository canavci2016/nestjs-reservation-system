import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import {
  ConflictException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
import { AuthGuard } from 'src/auth/auth.guard';
import { User as UserDecorator } from 'src/auth/auth.decorator';
import { AwsService } from 'src/aws/aws.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
  ) {}

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

    const setPasswordUrl = `${process.env.APP_URL}/user/set-password?token=${token.content}`;

    const attributes = {
      action: { DataType: 'String', StringValue: 'CLIENTAPP_CREATE_ACCOUNT' },
      name: { DataType: 'String', StringValue: userModel.name },
      lastName: { DataType: 'String', StringValue: userModel.lastName },
      passwordChangeUrl: {
        DataType: 'String',
        StringValue: setPasswordUrl,
      },
    };
    if (userModel.email) {
      attributes['email'] = {
        DataType: 'String',
        StringValue: userModel.email,
      };
    }
    if (userModel.phone) {
      attributes['phone'] = {
        DataType: 'String',
        StringValue: userModel.phone,
      };
    }

    if (userModel.email) {
      const response = await this.awsService.pushIntoQueue(attributes);
      console.log(response);
    }

    return Boolean(userModel);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [User])
  async AdminApp_Company_User_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('q', { nullable: true }) q: string,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<User[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.userService.findAll({
      q,
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
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

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async ClientApp_Profile_detail(
    @UserDecorator() userDto: { sub: string },
  ): Promise<User> {
    const user = await this.userService.findOne({ id: userDto.sub });

    if (!user) {
      throw new NotFoundException('user isnot found');
    }

    return user;
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
