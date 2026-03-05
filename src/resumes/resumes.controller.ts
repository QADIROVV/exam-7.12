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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto, ResumeQueryDto } from './dto/resume.dto';
import { ResumeStatus } from './schemas/resume.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Resumes')
@Controller('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  //  Rezyumalar ro'yxati (faqat employer) ──
  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Barcha rezyumalar (Employer uchun qidiruv)' })
  findAll(@Query() query: ResumeQueryDto) {
    return this.resumesService.findAll(query);
  }

  //  Rezyume yaratish 
  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Yangi rezyume yaratish (Jobseeker)' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateResumeDto,
  ) {
    return this.resumesService.create(userId, dto);
  }

  //  O'z rezyumalari 
  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'O\'z rezyumalari (Jobseeker)' })
  findMy(@CurrentUser('userId') userId: string) {
    return this.resumesService.findByOwner(userId);
  }

  //  Bitta rezyume ──
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rezyume ma\'lumotlari' })
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  //  Rezyumani yangilash ──
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Rezyumani yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumesService.update(id, userId, dto);
  }

  @Post(':id/upload')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Rezyume fayl yuklash (PDF/DOC)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          cb(null, `resume_${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx/;
        const ext = allowed.test(extname(file.originalname).toLowerCase());
        cb(
          ext ? null : new Error('Faqat PDF, DOC, DOCX fayllar ruxsat'),
          ext,
        );
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadFile(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = `/uploads/resumes/${file.filename}`;
    return this.resumesService.uploadFile(id, userId, filePath);
  }

  //  Status o'zgartirish ──
  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @ApiOperation({ summary: 'Rezyume statusini o\'zgartirish (active/hidden/draft)' })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('status') status: ResumeStatus,
  ) {
    return this.resumesService.changeStatus(id, userId, status);
  }

  //  O'chirish 
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.JOBSEEKER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rezyumani o\'chirish' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.resumesService.remove(id, userId);
  }
}
