import { Resolver, Mutation, Args, Query, Directive } from '@nestjs/graphql';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { UserService } from './user.service';
import { UserAddInput } from './dto/user-add.input';
import { UserResponseDto } from './dto/user-response.dto';
import { UserUpdateInput } from './dto/user-update.input';
import * as moment from 'moment';
import { AwsService } from '../../../core/modules/aws/aws.service';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from '../../../core/modules/aws/aws-sqs-message-qb';
import { ConfigService } from '../../../core/modules/config/config.service';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { TokenService } from '../../../core/modules/token/services/token.service';
import { TokenTypes } from '../../../shared/modules/app-token/token-types.enum';
import { RemoveSpacesPipe } from 'src/core/pipes/remove-spaces-pipe';
import { AdminAuthRole } from '../admin_auth/admin-auth-role.enum';

@Resolver()
export class AdminAppUserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) { }

  @Directive('@deprecated(reason: "Use AdminApp_User_add instead")')
  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => UserResponseDto)
  async AdminApp_Company_User_add(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload', RemoveSpacesPipe) payload: UserAddInput,
  ): Promise<UserResponseDto> {
    const userModel = await this.userService.save({
      ...payload,
      companyId: admin.companyId,
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

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => UserResponseDto)
  async AdminApp_User_add(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload', RemoveSpacesPipe) payload: UserAddInput,
  ): Promise<UserResponseDto> {
    const userModel = await this.userService.save({
      ...payload,
      companyId: admin.companyId,
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
  @AdminAuth()
  @Query(() => [UserResponseDto])
  async AdminApp_Company_User_list(
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

  //TODO: remove this use AdminApp_User_list
  @AdminAuth()
  @Query(() => [UserResponseDto])
  async AdminApp_Employee_User_list(
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
  @AdminAuth()
  @Query(() => UserResponseDto)
  async AdminApp_Company_User_detail(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id', { nullable: true }) id: string,
  ) {
    const model = await this.userService.findOne({
      companyId: admin.companyId,
      id: id,
    });
    return model;
  }

  //TODO: remove this use AdminApp_User_detail
  @AdminAuth()
  @Query(() => UserResponseDto)
  async AdminApp_Employee_User_detail(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id', { nullable: true }) id: string,
  ) {
    const model = await this.userService.findOne({
      companyId: admin.companyId,
      id: id,
    });
    return model;
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_User_update(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('userId') userId: string,
    @Args('payload') payload: UserUpdateInput,
  ): Promise<boolean> {
    const model = await this.userService.updateById(userId, {
      ...payload,
      companyId: admin.companyId,
      isActive: payload.isActive || true,
    });
    return Boolean(model?.affected);
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_User_delete(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.userService.deleteById({
      id,
      companyId: admin.companyId,
    });

    return Boolean(model.affected);
  }
}
