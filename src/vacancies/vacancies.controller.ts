import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/vacancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Vacancies')
@Controller('vacancies')
export class VacanciesController {
  constructor(private vacanciesService: VacanciesService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha vakansiyalar (filtr bilan)' })
  @ApiQuery({ name: 'search',          required: false })
  @ApiQuery({ name: 'city',            required: false })
  @ApiQuery({ name: 'employmentType',  required: false })
  @ApiQuery({ name: 'experienceLevel', required: false })
  @ApiQuery({ name: 'categoryId',      required: false })
  @ApiQuery({ name: 'companyId',       required: false })
  @ApiQuery({ name: 'isRemote',        required: false, type: Boolean })
  findAll(
    @Query('search')          search?: string,
    @Query('city')            city?: string,
    @Query('employmentType')  employmentType?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('categoryId')      categoryId?: string,
    @Query('companyId')       companyId?: string,
    @Query('isRemote')        isRemote?: string,
  ) {
    return this.vacanciesService.findAll(
      search, city, employmentType, experienceLevel,
      categoryId, companyId,
      isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Kompaniya vakansiyalari' })
  @ApiParam({ name: 'companyId', format: 'uuid' })
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.vacanciesService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Vakansiyani ID boyicha olish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    await this.vacanciesService.incrementViews(id);
    return this.vacanciesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiya yaratish - Employer/Admin' })
  create(@Body() dto: CreateVacancyDto, @CurrentUser('id') userId: string) {
    return this.vacanciesService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiya yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVacancyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.vacanciesService.update(id, dto, userId);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiyani elor qilish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.vacanciesService.publish(id, userId);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiyani yopish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  close(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.vacanciesService.close(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vakansiya uchirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.vacanciesService.remove(id, user.id, user.role);
  }
}
