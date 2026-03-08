import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

// Entities
import { User } from './users/entities/user.entity';
import { Company } from './companies/entities/company.entity';
import { Vacancy } from './vacancies/entities/vacancy.entity';
import { Resume } from './resumes/entities/resume.entity';
import { Category } from './categories/entities/category.entity';
import { Application } from './applications/entities/application.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { ResumesModule } from './resumes/resumes.module';
import { CategoriesModule } from './categories/categories.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL bilan TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get<string>('DB_USER') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || '1111',
        database: config.get<string>('DB_NAME') || 'hh_db',
        entities: [User, Company, Vacancy, Resume, Category, Application],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGO_URI') ||
          'mongodb://127.0.0.1:27017/hh_notifications',
      }),
    }),

    AuthModule,
    UsersModule,
    CompaniesModule,
    VacanciesModule,
    ResumesModule,
    CategoriesModule,
    ApplicationsModule,
    NotificationsModule,
    UploadsModule,
  ],
})
export class AppModule {}