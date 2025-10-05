import { Global, Module } from '@nestjs/common';
import { AwsService } from './aws.service';

@Global()
@Module({
  imports: [],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
