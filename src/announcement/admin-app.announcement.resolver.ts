import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { AnnouncementService } from './announcement.service';
import { Announcement } from './models/announcement.model';
import { AddAnnouncementInput } from './dto/add-announcement.input';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AdminAppAnnouncementResolver {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly awsService: AwsService,
  ) {}

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

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_COMPANY_ANNOUNCEMENT_ADD')
      .setStr('announcementModel', model);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());

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
}
