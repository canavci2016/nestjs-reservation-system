import { Resolver, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { CompanyAppGuard } from '../../../company_auth/company_app.guard';
import { CompanyApp } from '../../../company_auth/company_app.decorator';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';

@Resolver()
export class ClientAppAnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @UseGuards(CompanyAppGuard)
  @Query(() => [AnnouncementResponseDto])
  async ClientApp_Announcement_list(
    @CompanyApp()
    company: { id: string },
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<AnnouncementResponseDto[]> {
    const models = await this.announcementService.findAll({
      companyId: company.id,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => AnnouncementResponseDto)
  async ClientApp_Announcement_detail(
    @CompanyApp()
    company: { id: string },
    @Args('id') id: string,
  ): Promise<AnnouncementResponseDto> {
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
