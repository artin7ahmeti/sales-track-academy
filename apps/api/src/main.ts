import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerEnabled = parseBoolean(process.env.SWAGGER_ENABLED, !isProduction);

  // Security
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: swaggerEnabled ? false : undefined,
    }),
  );
  const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('SalesTrack Academy API')
      .setDescription(
        [
          'API documentation for SalesTrack Academy.',
          'Most protected endpoints accept either:',
          '- `Authorization: Bearer <access_token>` header',
          '- `access_token` httpOnly cookie',
          'Responses are wrapped in `{ data: ... }` by the global response interceptor.',
        ].join('\n'),
      )
      .setVersion('1.0.0')
      .addServer('http://localhost:3001', 'Local')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT access token here',
        },
        'bearer',
      )
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
      }, 'access_token')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, documentFactory, {
      jsonDocumentUrl: 'api/docs-json',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}/api`);
  if (swaggerEnabled) {
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
