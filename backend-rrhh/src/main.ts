import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Set timezone to Argentina
  process.env.TZ = 'America/Argentina/Buenos_Aires';

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Determine if we're in production
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Configure frame ancestors based on environment
  const frameAncestors = isProduction
    ? ["'self'", configService.get('FRONTEND_URL'), configService.get('LANDING_URL')]
    : ["'self'", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

  // Security - Configure helmet to allow iframe embedding for PDFs
  app.use(helmet({
    frameguard: {
      action: 'sameorigin'
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        frameAncestors,
        frameSrc: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null
      }
    }
  }));

  // CORS - Configure based on environment
  const corsOrigin = configService.get('CORS_ORIGIN');
  const corsOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin: string) => origin.trim())
    : [
        configService.get('FRONTEND_URL'),
        configService.get('LANDING_URL'),
        'http://localhost:3001',
        'http://localhost:3002'
      ];

  console.log('🔐 CORS Origins:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Static files for uploaded CVs
  const express = require('express');

  // Special route for PDF viewing with appropriate headers
  app.use('/view-pdf', (req, res, next) => {
    // Remove X-Frame-Options for PDF viewing
    res.removeHeader('X-Frame-Options');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Type', 'application/pdf');
    next();
  }, express.static(join(__dirname, '..', 'uploads')));

  // Regular static file serving
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
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

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Elevas HR Backend running on: http://localhost:${port}/api`);
  console.log(`📖 Environment: ${configService.get('NODE_ENV')}`);
  console.log(`🗃️  Database: ${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_DATABASE')}`);
}
bootstrap();
