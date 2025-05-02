import { Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';

@Resolver()
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  @Query(() => String)
  Company_getDetail(): string {
    return 'Hello World!';
  }

  @Query(() => String)
  async Company_add(): Promise<string> {
    await this.service.save({
      secretKey:
        'UzsgvMKR5UItceRoU1uRcqRLzh80QHyVDM898oL48gweuycl0weTOxYXak9pS2VK9GbE34RyhVsMKqIZb36EoyAPr4WyYGl4UJI9Hw42mlHVhvUgOPQ70K1JWulePBoCJjMKv1bYPXTxfwJ3AkzRLvl3Kc68H185WZPcggFwyK84O0u1FddPZo1zCH0JY3mhwALBaStyZLidwopPJYYma6bpBEeM',
      name: 'ak polat',
      isActive: true,
    });
    return 'Hello World!';
  }
}
