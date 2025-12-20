import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { UploadService } from './upload.service';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';
import { FileUpload } from 'src/core/interfaces/file-upload.interface';
import { UploadServiceTypEnum } from './interfaces/upload.interface';

@Controller('admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @AdminAuth()
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Admin() admin: AuthAdminDecoratorInterface,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // ... Set of file validator instances here
        ],
      }),
    )
    file: any,
    @Body('service') service: UploadServiceTypEnum,
  ) {
    const allowedServiceTypes = Object.values(UploadServiceTypEnum);
    if (!file) throw new BadRequestException('file is required');
    if (!allowedServiceTypes.includes(service)) {
      throw new BadRequestException(
        'service parameter must be one of the keys: ' +
          allowedServiceTypes.join(', '),
      );
    }

    const fileUpload: FileUpload = {
      filename: file.originalname,
      mimetype: file.mimetype,
      encoding: '',
      createReadStream: () => {
        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);
        return stream;
      },
    };

    const url = await this.uploadService.upload({
      service: service,
      file: Promise.resolve(fileUpload),
      companyId: admin.companyId,
    });
    return { url };
  }
}
