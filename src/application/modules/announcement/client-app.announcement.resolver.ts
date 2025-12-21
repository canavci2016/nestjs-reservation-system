import { Resolver, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.decorator';
import { AuthUserDecoratorInterface } from '../auth/interfaces/auth-employee-decorator.interface';

@Resolver()
export class ClientAppAnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) { }

  @UseGuards(AuthGuard)
  @Query(() => [AnnouncementResponseDto])
  async ClientApp_Announcement_list(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<AnnouncementResponseDto[]> {
    const models = await this.announcementService.findAll({
      companyId: authUser.user.companyId,
      pagination: pagination,
    });
    return models;
  }

  @UseGuards(AuthGuard)
  @Query(() => AnnouncementResponseDto)
  async ClientApp_Announcement_detail(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('id') id: string,
  ): Promise<AnnouncementResponseDto> {
    const model = await this.announcementService.findOne({
      companyId: authUser.user.companyId,
      id: id,
    });

    if (!model) {
      throw new NotFoundException('announcement is not found');
    }

    return model;
  }
}
