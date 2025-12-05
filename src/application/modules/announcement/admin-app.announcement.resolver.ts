import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { PaginationInput } from '../../../core/modules/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { AddAnnouncementInput } from './dto/add-announcement.input';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import { PaginationPipe } from '../../../core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from '../../../core/modules/aws/aws-sqs-message-qb';
import { AwsService } from '../../../core/modules/aws/aws.service';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';

@Resolver()
export class AdminAppAnnouncementResolver {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly awsService: AwsService,
  ) {}

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_add(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('payload') payload: AddAnnouncementInput,
  ): Promise<boolean> {
    const model = await this.announcementService.save({
      ...payload,
      companyId: admin.companyId,
      isActive: true,
    });

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_COMPANY_ANNOUNCEMENT_ADD')
      .setStr('announcementModel', model);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());

    return Boolean(response.$metadata.httpStatusCode === 200);
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_update(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: UpdateAnnouncementInput,
  ): Promise<boolean> {
    const model = await this.announcementService.updateById(
      { id, companyId: admin.companyId },
      {
        ...payload,
        companyId: admin.companyId,
        isActive: true,
      },
    );
    return Boolean(model.affected);
  }

  @AdminAuth()
  @Query(() => [AnnouncementResponseDto])
  async AdminApp_Company_Announcement_list(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
  ): Promise<AnnouncementResponseDto[]> {
    const models = await this.announcementService.findAll({
      companyId: admin.companyId,
      pagination: pagination,
    });
    return models;
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Company_Announcement_delete(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.announcementService.deleteById({
      id,
      companyId: admin.companyId,
    });
    return Boolean(model.affected);
  }
}
