import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ENV } from './config/environment';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for corporate frontend communication
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global exception filter for human-friendly standardized JSON errors
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(ENV.PORT);
  logger.log(`================================================================`);
  logger.log(` Corporate Employee & Intern Work Management Portal API running `);
  logger.log(` Local URL: http://localhost:${ENV.PORT}                        `);
  logger.log(` Swagger Docs: http://localhost:${ENV.PORT}/api/docs            `);
  logger.log(` Environment: ${ENV.NODE_ENV}                                   `);
  logger.log(` Default Admin: admin@corporate.com / Admin@123456             `);
  logger.log(`================================================================`);
}

bootstrap();
