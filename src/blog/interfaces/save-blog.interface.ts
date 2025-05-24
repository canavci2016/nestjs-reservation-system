import { FileUpload } from './file-upload.interface';

export interface SaveBlog {
  title: string;
  description: string;
  companyId: string;
  photoUrl: string;
  isActive: boolean;
  photo: Promise<FileUpload>;
}
