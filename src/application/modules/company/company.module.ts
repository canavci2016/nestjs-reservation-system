import { Global, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { SuperadminAuthModule } from '../superadmin_auth/superadmin_auth.module';
import { FileUploadModule } from '../../shared/modules/file-upload/file-upload.module';
import { AdminAppCompanyResolver } from './admin-app.company.resolver';
import { ClientAppCompanyResolver } from './client-app.company.resolver';
import { SuperAdminCompanyResolver } from './superadmin.company.resolver';

@Global()
@Module({
  imports: [SuperadminAuthModule, FileUploadModule],
  providers: [
    CompanyService,
    AdminAppCompanyResolver,
    ClientAppCompanyResolver,
    SuperAdminCompanyResolver,
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
