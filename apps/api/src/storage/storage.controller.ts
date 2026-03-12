import { Controller } from '@nestjs/common';
import { StorageAppService } from './storage-app.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageAppService: StorageAppService) {}
}
