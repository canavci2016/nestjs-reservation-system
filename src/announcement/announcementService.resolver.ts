import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_auth.decorator';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { Announcement } from './models/announcement.model';
import { AddAnnouncementInput } from './dto/add-announcement.input';

@Resolver()
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @UseGuards(CompanyAppGuard)
  @Mutation(() => Boolean)
  async Announcement_add(
    @CompanyApp() company: { id: string },
    @Args('payload') payload: AddAnnouncementInput,
  ): Promise<boolean> {
    const model = await this.announcementService.save({
      ...payload,
      companyId: company.id,
      isActive: true,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => [Announcement])
  async Announcement_list(
    @CompanyApp() company: { id: string },
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<Announcement[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.announcementService.findAll({
      companyId: company.id,
      pagination: paginationObj,
    });
    return models;
  }
}
