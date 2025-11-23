import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { IsYYYYMMDD } from 'src/core/validation/isyymmdd.decorator';

@ArgsType()
export class AdminAppCompanyEmployeeListAvailabilityArgs {
  @IsOptional()
  @IsYYYYMMDD()
  @Field({ nullable: true })
  startDate?: string;

  @IsOptional()
  @IsYYYYMMDD()
  @Field({ nullable: true })
  endDate?: string;

  @Field()
  employeeId: string;
}
