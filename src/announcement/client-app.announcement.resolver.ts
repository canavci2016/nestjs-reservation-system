import { Resolver, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { Announcement } from './models/announcement.model';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppAnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

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
