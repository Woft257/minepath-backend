process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
  console.error('CRITICAL: Uncaught Exception:', err, 'Origin:', origin);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  try {
    console.log('Bootstrap: Creating Nest application...');
    const app = await NestFactory.create(AppModule);
    console.log('Bootstrap: Nest application created.');

    const config = new DocumentBuilder()
      .setTitle('Minepath API')
      .setDescription('The Minepath API description')
      .setVersion('1.0')
      .addTag('Admin Dashboard')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('Bootstrap: Swagger UI setup complete.');

    app.enableCors();

    await app.listen(process.env.PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('CRITICAL: Error during bootstrap process:', error);
    process.exit(1);
  }
}

bootstrap();

