import {
  Controller, Post, Get, Body, Query, UseGuards,
} from '@nestjs/common';
import { StorageAppService } from './storage-app.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@salestrack/contracts';
import { UploadUrlDto } from './dto/upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StorageController {
  constructor(private readonly storageAppService: StorageAppService) {}

  @Post('upload-url')
  getUploadUrl(@Body() dto: UploadUrlDto) {
    return this.storageAppService.getUploadUrl(
      dto.fileName, dto.contentType, dto.entityType, dto.entityId,
    );
  }

  @Post('confirm')
  confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.storageAppService.confirmUpload(dto.key);
  }

  @Get('download-url')
  getDownloadUrl(@Query('key') key: string) {
    return this.storageAppService.getDownloadUrl(key);
  }
}
