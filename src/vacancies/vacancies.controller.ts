import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto, UpdateVacancyDto, VacancyQueryDto } from './dto/vacancy.dto';
import { VacancyStatus } from './schemas/vacancy.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Vacancies')
@Controller('vacancies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  // ─── Vakansiyalar ro'yxati 
  @Public()
  @Get()
  @ApiOperation({ summary: 'Barcha vakansiyalar (qidiruv va filter bilan)' })
  findAll(@Query() query: VacancyQueryDto) {
    return this.vacanciesService.findAll(query);
  }

  // ─── Vakansiya yaratish 
  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @ApiOperation({ summary: 'Yangi vakansiya yaratish (Employer)' })
  @ApiResponse({ status: 201, description: 'Vakansiya yaratildi' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateVacancyDto,
  ) {
    return this.vacanciesService.create(userId, dto);
  }

  // ─── O'z vakansiyalarim 
  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @ApiOperation({ summary: 'O\'z vakansiyalarim (Employer)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findMy(
    @CurrentUser('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.vacanciesService.findByEmployer(userId, page, limit);
  }

  // ─── Statistika 
  @Get('my/stats')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @ApiOperation({ summary: 'Vakansiyalar statistikasi' })
  getStats(@CurrentUser('userId') userId: string) {
    return this.vacanciesService.getStats(userId);
  }

  // ─── Bitta vakansiya 
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Vakansiya ma\'lumotlari' })
  findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }

  // ─── O'xshash 
  @Public()
  @Get(':id/similar')
  @ApiOperation({ summary: 'O\'xshash vakansiyalar' })
  findSimilar(@Param('id') id: string) {
    return this.vacanciesService.findSimilar(id);
  }

  // ─── Vakansiyani yangilash 
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @ApiOperation({ summary: 'Vakansiyani yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateVacancyDto,
  ) {
    return this.vacanciesService.update(id, userId, dto);
  }

  // ─── Status o'zgartirish ─────────────────────────────────────────
  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @ApiOperation({ summary: 'Vakansiya statusini o\'zgartirish' })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('status') status: VacancyStatus,
  ) {
    return this.vacanciesService.changeStatus(id, userId, status);
  }

  // ─── O'chirish ─
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Vakansiyani o\'chirish' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.vacanciesService.remove(id, userId);
  }
}
