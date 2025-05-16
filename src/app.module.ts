import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CompanyModule } from './company/company.module';
import { CompanyAuthModule } from './company_auth/company_auth.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { EmployeeModule } from './employee/employee.module';
import { DeviceModule } from './device/device.module';
import { EmployeeAvailabilityModule } from './employee_availability/employee-availability.module';
import { UserEmployeeAppointmentModule } from './user_employee_appointment/user_employee_appointment.module';
import { DatabaseModule } from './database/database.module';
import { EmployeeAuthModule } from './employee_auth/employee_auth.module';
import { AdminAuthModule } from './admin_auth/admin_auth.module';

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
    CompanyModule,
    CompanyAuthModule,
    ConfigModule.forRoot(),
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
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
      },
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    UserModule,
    AuthModule,
    BlogModule,
    AnnouncementModule,
    EmployeeModule,
    DeviceModule,
    EmployeeAvailabilityModule,
    UserEmployeeAppointmentModule,
    DatabaseModule,
    EmployeeAuthModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, configFactory],
})
export class AppModule {}
