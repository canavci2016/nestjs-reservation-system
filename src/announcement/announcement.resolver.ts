import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { Announcement } from './models/announcement.model';
import { AddAnnouncementInput } from './dto/add-announcement.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';

@Resolver()
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

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
  @Query(() => [Announcement])
  async AdminApp_Company_Announcement_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Announcement[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.announcementService.findAll({
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
  }
}
