import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificatePdfService } from './certificate-pdf.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificatePdfService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
