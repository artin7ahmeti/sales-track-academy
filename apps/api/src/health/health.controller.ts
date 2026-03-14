import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Checks API and database connectivity.' })
  @ApiOkResponse({
    description: 'Health status',
    schema: {
      example: {
        data: {
          status: 'ok',
          timestamp: '2026-03-14T10:00:00.000Z',
          services: {
            database: 'ok',
            mail: {
              configured: true,
              ready: true,
              error: null,
            },
          },
        },
      },
    },
  })
  async check() {
    let databaseStatus: 'ok' | 'error' = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'error';
    }

    return {
      status: databaseStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        mail: this.mail.status,
      },
    };
  }
}
