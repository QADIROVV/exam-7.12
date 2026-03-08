import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Vakansiyaga ariza yuborish - Jobseeker' })
  @ApiResponse({ status: 201, description: 'Ariza yuborildi. Ish beruvchiga bildirishnoma ketdi.' })
  @ApiResponse({ status: 409, description: 'Allaqachon ariza yuborilgan' })
  create(@Body() dto: CreateApplicationDto, @CurrentUser('id') userId: string) {
    return this.applicationsService.create(dto, userId);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Mening arizalarim' })
  findMine(@CurrentUser('id') userId: string) {
    return this.applicationsService.findMine(userId);
  }

  @Get('vacancy/:vacancyId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Vakansiyaga kelgan arizalar - Employer' })
  @ApiParam({ name: 'vacancyId', format: 'uuid' })
  findByVacancy(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.findByVacancy(vacancyId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ariza tafsilotlari' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Ariza statusini ozgartirish - Employer (ariza egasiga bildirishnoma ketadi)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.updateStatus(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOBSEEKER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arizani qaytarib olish - faqat pending holda' })
  @ApiParam({ name: 'id', format: 'uuid' })
  withdraw(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.applicationsService.withdraw(id, userId);
  }
}
