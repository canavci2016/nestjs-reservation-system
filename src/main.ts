import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: false });
  app.use(
    '/graphql',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }),
  );

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
