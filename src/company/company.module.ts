import { Global, Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { SuperadminAuthModule } from 'src/superadmin_auth/superadmin_auth.module';
import { FileUploadModule } from 'src/shared/modules/file-upload/file-upload.module';

@Global()
@Module({
  imports: [SuperadminAuthModule, FileUploadModule],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
