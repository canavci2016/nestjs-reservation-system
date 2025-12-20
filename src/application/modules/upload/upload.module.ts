import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileUploadModule } from '../../shared/modules/file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  providers: [UploadService],
  exports: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
