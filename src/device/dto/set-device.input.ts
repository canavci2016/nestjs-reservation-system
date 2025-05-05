import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetDeviceInput {
  @Field()
  token: string;
}
