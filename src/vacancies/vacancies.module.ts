import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { Vacancy } from './entities/vacancy.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports:     [TypeOrmModule.forFeature([Vacancy]), CompaniesModule],
  controllers: [VacanciesController],
  providers:   [VacanciesService],
  exports:     [VacanciesService],
})
export class VacanciesModule {}
