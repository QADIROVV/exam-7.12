import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { VacanciesModule } from '../vacancies/vacancies.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports:     [TypeOrmModule.forFeature([Application]), VacanciesModule, NotificationsModule],
  controllers: [ApplicationsController],
  providers:   [ApplicationsService],
  exports:     [ApplicationsService],
})
export class ApplicationsModule {}
