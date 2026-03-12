import { Module } from '@nestjs/common';
import { StorageAppService } from './storage-app.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageAppService],
  exports: [StorageAppService],
})
export class StorageModule {}
