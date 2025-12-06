import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthAdminProfileResponseDto {
  @Field({ description: 'company id' })
  companyId: string;

  @Field({ description: 'Enable user package system' })
  enableUserPackageSystem: boolean;
}
