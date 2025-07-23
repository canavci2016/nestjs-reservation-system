import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { Announcement } from './models/announcement.model';
import { AddAnnouncementInput } from './dto/add-announcement.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { PaginationPipe } from 'src/pagination/pagination.pipe';

@Resolver()
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) { }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: AddAnnouncementInput,
  ): Promise<boolean> {
    const model = await this.announcementService.save({
      ...payload,
      companyId: company.sub,
      isActive: true,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateAnnouncementInput,
  ): Promise<boolean> {
    const model = await this.announcementService.updateById(
      { id, companyId: company.sub },
      {
        ...payload,
        companyId: company.sub,
        isActive: true,
      },
    );
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [Announcement])
  async AdminApp_Company_Announcement_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Announcement[]> {
    const models = await this.announcementService.findAll({
      companyId: company.sub,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.announcementService.deleteById({
      id,
      companyId: company.sub,
    });
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => [Announcement])
  async ClientApp_Announcement_list(
    @CompanyApp()
    company: { id: string },
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<Announcement[]> {
    const models = await this.announcementService.findAll({
      companyId: company.id,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => Announcement)
  async ClientApp_Announcement_detail(
    @CompanyApp()
    company: { id: string },
    @Args('id') id: string,
  ): Promise<Announcement> {
    const model = await this.announcementService.findOne({
      companyId: company.id,
      id: id,
    });

    if (!model) {
      throw new NotFoundException('announcement is not found');
    }

    return model;
  }
}
