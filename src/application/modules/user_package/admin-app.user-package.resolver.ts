import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from 'src/application/modules/company_auth/company_auth.guard';
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
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';
import { Employee } from 'src/employee_auth/employee.decorator';
import { AuthEmployeeDecoratorInterface } from 'src/employee_auth/interfaces/auth-employee-decorator.interface';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { CompanyUpdateUserPackageCommonTableInput } from './dto/company-update-user-package-common-table.input';

@Resolver()
export class AdminAppUserPackageResolver {
  constructor(
    private readonly packageService: UserPackageService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyAddUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.save({
      ...payload,
      companyId: company.sub,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: CompanyUpdateUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.updateById(
      {
        id,
        companyId: company.sub,
      },
      {
        ...payload,
        companyId: company.sub,
      },
    );
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [CompanyUserPackage])
  async AdminApp_Company_UserPackage_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<CompanyUserPackage[]> {
    const models = await this.packageService.findAll({
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [UserAndCompanyUserPackage])
  async AdminApp_Company_UserPackage_listForAUser(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const user = await this.userService.findOne({
      companyId: company.sub,
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user isnot found');
    }

    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: company.sub,
      pagination: pagination,
    });

    const result = models.map((m) => ({
      ...m,
      startDate: m.startDate.toString(),
      endDate: m.endDate.toString(),
    }));

    return result;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => Boolean)
  async AdminApp_Company_UserPackage_updateForAUser(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('user') userId: string,
    @Args('packageId') packageId: string,
    @Args('payload') payload: CompanyUpdateUserPackageCommonTableInput,
  ) {
    const user = await this.userService.findOne({
      companyId: company.sub,
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

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.packageService.deleteById({
      id,
      companyId: company.sub,
    });
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_attach(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyAttachUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.attachACompanyUserPackageToUser({
      userId: payload.userId,
      id: payload.id,
      companyId: company.sub,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
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

  @UseGuards(EmployeeAuthGuard)
  @Query(() => [UserAndCompanyUserPackage])
  async AdminApp_Employee_UserPackage_listForAUser(
    @Employee() employee: AuthEmployeeDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const user = await this.userService.findOne({
      companyId: employee.employee.companyId,
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('user isnot found');
    }

    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: employee.employee.companyId,
      pagination: pagination,
    });

    const result = models.map((m) => ({
      ...m,
      startDate: m.startDate.toString(),
      endDate: m.endDate.toString(),
    }));

    return result;
  }
}