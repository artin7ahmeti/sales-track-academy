import {
  Controller, Get, Post, Param, Res, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Certificates')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Get my certificates' })
  @ApiOkResponse({ description: 'List of certificates for the current user.' })
  findMyCertificates(@CurrentUser() user: { id: string }) {
    return this.certificatesService.findByUser(user.id);
  }

  @Get(':id/download')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Download certificate PDF' })
  @ApiParam({ name: 'id', description: 'Certificate id' })
  @ApiOkResponse({ description: 'Certificate PDF file.' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.certificatesService.downloadCertificate(id, user.id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, no-store',
    });

    res.end(buffer);
  }

  @Post('generate/:courseId')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Generate certificate for completed course' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Generated certificate.' })
  generate(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.certificatesService.generateCertificate(courseId, user.id);
  }
}
