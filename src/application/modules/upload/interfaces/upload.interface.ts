import { FileUpload } from 'src/core/interfaces/file-upload.interface';

export enum UploadServiceTypEnum {
  COMPANY = 'company',
  BLOG = 'blog',
  ANNOUNCEMENT = 'announcement',
}

export interface IUpload {
  service: UploadServiceTypEnum;
  file: Promise<FileUpload> | undefined | null;
  companyId: string;
}
