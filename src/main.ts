import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({ origin: '*' });

  // Static uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HH.uz API')
    .setDescription('HH.uz ish qidirish portali - NestJS + PostgreSQL + MongoDB')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Auth',          'Register, Login, Logout, Token yangilash')
    .addTag('Users',         'Foydalanuvchi profili')
    .addTag('Companies',     'Kompaniyalar')
    .addTag('Vacancies',     'Vakansiyalar')
    .addTag('Resumes',       'Rezyumalar')
    .addTag('Applications',  'Arizalar')
    .addTag('Categories',    'Kategoriyalar')
    .addTag('Notifications', 'Bildirishnomalar (MongoDB)')
    .addTag('Uploads',       'Fayl yuklash')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger dokumentatsiya: http://localhost:${port}/api/docs`);
}

bootstrap();