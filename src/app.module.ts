import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { CoreModule } from './core/core.module';
import { GraphQLFormattedError } from 'graphql';
import {
  AcceptLanguageResolver,
  GraphQLWebsocketResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';

const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return {
      test: 'dad',
    };
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.APP_KEY,
      signOptions: { expiresIn: '10d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: process.env.DB_SYNC_SCHEMA === 'true',
      extra: {
        ssl:
          process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
      },
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      csrfPrevention: false,
      formatError: (formattedError: GraphQLFormattedError) => {
        const originalError = formattedError?.extensions?.originalError as
          | { message: string[] }
          | undefined;

        const messages: string[] = [];
        if (Array.isArray(originalError?.message)) {
          messages.push(...originalError.message);
        } else {
          messages.push(formattedError.message);
        }

        const message =
          messages.length > 0 ? messages.join(', ') : formattedError.message;
        return {
          message,
        };
      },
      context: (ctx) => ctx,
      path: '/graphql',
    }),
    ApplicationModule,
    DatabaseModule,
    CoreModule,
    I18nModule.forRoot({
      fallbackLanguage: 'tr',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        GraphQLWebsocketResolver,
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, configFactory],
})
export class AppModule { }
