import { Injectable } from '@nestjs/common';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';
import { AwsService } from 'src/core/modules/aws/aws.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly awsService: AwsService) {
    console.log('FileUploadService initialized');
  }

  async blog(
    file: Promise<FileUpload> | undefined | null,
    payload: { companyId: string },
  ) {
    if (typeof file != 'undefined' && file != null) {
      const imageFile: FileUpload = await file;
      const fileName = `${payload.companyId}/blog/${Date.now()}_${imageFile.filename}`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );
      return filePath.Location;
    }
    return null;
  }

  async announcement(
    file: Promise<FileUpload> | undefined | null,
    payload: { companyId: string },
  ) {
    if (typeof file != 'undefined' && file != null) {
      const imageFile: FileUpload = await file;
      const fileName = `${payload.companyId}/announcement/${Date.now()}_${imageFile.filename}`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );
      return filePath.Location;
    }
    return null;
  }

  async company(
    file: Promise<FileUpload> | undefined | null,
    payload: { companyId: string },
  ) {
    if (typeof file != 'undefined' && file != null) {
      const imageFile: FileUpload = await file;
      const fileName = `${payload.companyId}/own-profile/${Date.now()}_${imageFile.filename}`;

      const filePath = await this.awsService.uploadOnS3AsStream(
        imageFile.createReadStream,
        fileName,
      );
      return filePath.Location;
    }
    return null;
  }
}
