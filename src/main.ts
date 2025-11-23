import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(new I18nValidationPipe());

  app.enableCors({ origin: '*' });
  app.use(
    '/graphql',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }),
  );

  app.useGlobalFilters(new I18nValidationExceptionFilter());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
