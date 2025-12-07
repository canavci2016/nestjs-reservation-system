import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { NotFoundException } from '@nestjs/common';
import { Company } from 'src/application/modules/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/application/modules/company_auth/interfaces/auth-company-decorator.interface';
import { CompanyUpdateUserPackageInput } from './dto/company-update-user-package.input';
import { CompanyAddUserPackageInput } from './dto/company-add-user-package.input';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { CompanyUserPackage } from './models/company-user-package.model';
import { CompanyAttachUserPackageInput } from './dto/company-attach-user-package.input';
import { UserAndCompanyUserPackage } from './models/user-and-company-user-package.model';
import { CompanyDetachUserPackageInput } from './dto/company-detach-user-package.input';
import { UserService } from 'src/application/modules/user/user.service';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { CompanyUpdateUserPackageCommonTableInput } from './dto/company-update-user-package-common-table.input';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';
import { AdminAuthRole } from '../admin_auth/admin-auth-role.enum';

@Resolver()
export class AdminAppUserPackageResolver {
  constructor(
    private readonly packageService: UserPackageService,
    private readonly userService: UserService,
  ) { }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_add(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload') payload: CompanyAddUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.save({
      ...payload,
      companyId: admin.companyId,
    });
    return Boolean(model);
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_update(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: CompanyUpdateUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.updateById(
      {
        id,
        companyId: admin.companyId,
      },
      {
        ...payload,
        companyId: admin.companyId,
      },
    );
    return Boolean(model.affected);
  }

  @AdminAuth(AdminAuthRole.COMPANY, AdminAuthRole.EMPLOYEE)
  @Query(() => [CompanyUserPackage])
  async AdminApp_UserPackage_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<CompanyUserPackage[]> {
    const models = await this.packageService.findAll({
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Query(() => [CompanyUserPackage], {
    deprecationReason: 'use the method AdminApp_UserPackage_list',
  })
  async AdminApp_Company_UserPackage_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<CompanyUserPackage[]> {
    const models = await this.packageService.findAll({
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Query(() => Boolean)
  async AdminApp_Company_UserPackage_updateForAUser(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('user') userId: string,
    @Args('packageId') packageId: string,
    @Args('payload') payload: CompanyUpdateUserPackageCommonTableInput,
  ) {
    const user = await this.userService.findOne({
      companyId: admin.companyId,
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user isnot found');
    }

    const packageModel =
      await this.packageService.findOneForUserAndCompanyUserPackagePivot({
        userId: userId,
        id: packageId,
      });

    if (!packageModel) {
      throw new NotFoundException('package isnot found');
    }

    const update = await this.packageService.updateUserAndCompanyPackage(
      packageId,
      payload,
    );

    return Boolean(update?.affected);
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_delete(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.packageService.deleteById({
      id,
      companyId: admin.companyId,
    });
    return Boolean(model.affected);
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_attach(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload') payload: CompanyAttachUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.attachACompanyUserPackageToUser({
      userId: payload.userId,
      id: payload.id,
      companyId: admin.companyId,
    });
    return Boolean(model);
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_detach(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyDetachUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.detachACompanyUserPackageFromUser({
      id: payload.id,
    });
    return Boolean(model.affected);
  }

  @AdminAuth()
  @Query(() => [UserAndCompanyUserPackage])
  async AdminApp_UserPackage_listForAUser(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: admin.companyId,
      pagination: pagination,
    });

    return models;
  }

  @AdminAuth(AdminAuthRole.COMPANY)
  @Query(() => [UserAndCompanyUserPackage], {
    deprecationReason: 'use AdminApp_UserPackage_listForAUser',
  })
  async AdminApp_Company_UserPackage_listForAUser(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: admin.companyId,
      pagination: pagination,
    });

    return models;
  }

  @AdminAuth(AdminAuthRole.EMPLOYEE)
  @Query(() => [UserAndCompanyUserPackage], {
    deprecationReason: 'use AdminApp_UserPackage_listForAUser',
  })
  async AdminApp_Employee_UserPackage_listForAUser(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: admin.companyId,
      pagination: pagination,
    });

    return models;
  }
}
