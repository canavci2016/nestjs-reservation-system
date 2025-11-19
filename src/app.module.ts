import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApplicationModule } from './application/application.module';
import { EmployeeAvailabilityModule } from './employee_availability/employee-availability.module';
import { UserEmployeeAppointmentModule } from './user_employee_appointment/user_employee_appointment.module';
import { DatabaseModule } from './database/database.module';
import { EmployeeAuthModule } from './employee_auth/employee_auth.module';
import { AdminAuthModule } from './admin_auth/admin_auth.module';
import { SuperadminAuthModule } from './superadmin_auth/superadmin_auth.module';
import { UserPackageModule } from './user_package/user_package.module';
import { JwtModule } from '@nestjs/jwt';
import { CoreModule } from './core/core.module';
import { GraphQLFormattedError } from 'graphql';

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
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 10, // Number of requests per time window
      },
    ]),
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
    }),
    ApplicationModule,
    EmployeeAvailabilityModule,
    UserEmployeeAppointmentModule,
    DatabaseModule,
    EmployeeAuthModule,
    AdminAuthModule,
    SuperadminAuthModule,
    UserPackageModule,
    ConfigModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, configFactory],
})
export class AppModule {}
