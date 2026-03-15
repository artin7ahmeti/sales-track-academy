import {
  Controller, Post, Get, Body, Query, UseGuards, ForbiddenException,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';
import { UploadUrlDto } from './dto/upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiTags('Storage')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class StorageController {
  constructor(private readonly storageAppService: StorageAppService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  @ApiOkResponse({ description: 'Presigned upload URL and object key.' })
  getUploadUrl(
    @Body() dto: UploadUrlDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    this.authorizeUpload(dto.entityType, dto.entityId, user);
    return this.storageAppService.getUploadUrl(
      dto.fileName, dto.contentType, dto.entityType, dto.entityId,
    );
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm uploaded object' })
  @ApiOkResponse({ description: 'Public/consumable URL for uploaded object.' })
  confirmUpload(
    @Body() dto: ConfirmUploadDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    this.authorizeKeyAccess(dto.key, user);
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

  private authorizeUpload(
    entityType: string,
    entityId: string,
    user: { id: string; role: string },
  ) {
    if (entityType === 'user-avatar') {
      if (entityId !== user.id) {
        throw new ForbiddenException('You can only upload your own avatar');
      }
    } else if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can upload this entity type');
    }
  }

  private authorizeKeyAccess(key: string, user: { id: string; role: string }) {
    if (key.startsWith('user-avatar/')) {
      const keyUserId = key.split('/')[1];
      if (keyUserId !== user.id) {
        throw new ForbiddenException('You can only confirm your own avatar upload');
      }
    } else if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can confirm this upload type');
    }
  }
}
