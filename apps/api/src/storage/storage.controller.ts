import {
  Controller, Post, Get, Body, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { StorageAppService } from './storage-app.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@salestrack/contracts';
import { UploadUrlDto } from './dto/upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Storage')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class StorageController {
  constructor(private readonly storageAppService: StorageAppService) {}

  @Post('upload-url')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get presigned upload URL (admin)' })
  @ApiOkResponse({ description: 'Presigned upload URL and object key.' })
  getUploadUrl(@Body() dto: UploadUrlDto) {
    return this.storageAppService.getUploadUrl(
      dto.fileName, dto.contentType, dto.entityType, dto.entityId,
    );
  }

  @Post('confirm')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Confirm uploaded object (admin)' })
  @ApiOkResponse({ description: 'Public/consumable URL for uploaded object.' })
  confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.storageAppService.confirmUpload(dto.key);
  }

  @Get('download-url')
  @ApiOperation({ summary: 'Get presigned download URL' })
  @ApiQuery({ name: 'key', required: true, description: 'Storage object key' })
  @ApiQuery({ name: 'inline', required: false, description: 'Set Content-Disposition to inline' })
  @ApiOkResponse({ description: 'Presigned temporary download URL.' })
  getDownloadUrl(
    @Query('key') key: string,
    @Query('inline') inline?: string,
  ) {
    return this.storageAppService.getDownloadUrl(key, inline === 'true');
  }
}
