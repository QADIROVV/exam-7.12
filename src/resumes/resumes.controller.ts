import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Resumes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Barcha rezyumalar - Employer/Admin' })
  @ApiQuery({ name: 'search',          required: false })
  @ApiQuery({ name: 'city',            required: false })
  @ApiQuery({ name: 'experienceLevel', required: false })
  findAll(
    @Query('search')          search?: string,
    @Query('city')            city?: string,
    @Query('experienceLevel') experienceLevel?: string,
  ) {
    return this.resumesService.findAll(search, city, experienceLevel);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mening rezyumalarim' })
  findMine(@CurrentUser('id') userId: string) {
    return this.resumesService.findMine(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Rezyumani ID boyicha olish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    await this.resumesService.incrementViews(id);
    return this.resumesService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOBSEEKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Rezyume yaratish - Jobseeker' })
  create(@Body() dto: CreateResumeDto, @CurrentUser('id') userId: string) {
    return this.resumesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Rezyume yangilash' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateResumeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.resumesService.update(id, dto, userId);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Rezyumani elor qilish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.publish(id, userId);
  }

  @Patch(':id/hide')
  @ApiOperation({ summary: 'Rezyumani yashirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  hide(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.hide(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rezyume uchirish' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.remove(id, userId);
  }
}
