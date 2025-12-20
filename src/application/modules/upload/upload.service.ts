import { Injectable, BadRequestException } from '@nestjs/common';
import { FileUploadService } from '../../shared/modules/file-upload/file-upload.service';
import { IUpload, UploadServiceTypEnum } from './interfaces/upload.interface';

@Injectable()
export class UploadService {
  constructor(private readonly fileUploadService: FileUploadService) { }

  async upload(payload: IUpload): Promise<string | null | undefined> {
    const companyId = payload.companyId;
    const file = payload.file;
    const service = payload.service;
    switch (service) {
      case UploadServiceTypEnum.COMPANY:
        return await this.fileUploadService.company(file, { companyId });
      case UploadServiceTypEnum.BLOG:
        return await this.fileUploadService.blog(file, { companyId });
      case UploadServiceTypEnum.ANNOUNCEMENT:
        return await this.fileUploadService.announcement(file, {
          companyId,
        });
      default:
        throw new BadRequestException('Unknown upload service type');
    }
  }
}
