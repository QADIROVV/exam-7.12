import {
  Controller, Post, UseInterceptors,
  UploadedFile, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadsService = new UploadsService();

@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { storage: uploadsService.makeStorage('avatars') }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Avatar yuklash (JPEG/PNG/WEBP, max 5MB)' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, description: 'Avatar yuklandi' })
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    this.uploadsService.validateImage(file);
    return {
      url:      this.uploadsService.getUrl('avatars', file.filename),
      filename: file.filename,
      size:     file.size,
    };
  }

  @Post('company-logo')
  @UseInterceptors(FileInterceptor('file', { storage: uploadsService.makeStorage('logos') }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Kompaniya logosi yuklash (JPEG/PNG/WEBP, max 5MB)' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, description: 'Logo yuklandi' })
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    this.uploadsService.validateImage(file);
    return {
      url:      this.uploadsService.getUrl('logos', file.filename),
      filename: file.filename,
      size:     file.size,
    };
  }

  @Post('resume-file')
  @UseInterceptors(FileInterceptor('file', { storage: uploadsService.makeStorage('resumes') }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Rezyume fayl yuklash (PDF/DOC/DOCX, max 10MB)' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, description: 'Fayl yuklandi' })
  uploadResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    this.uploadsService.validateDocument(file);
    return {
      url:          this.uploadsService.getUrl('resumes', file.filename),
      filename:     file.filename,
      originalName: file.originalname,
      size:         file.size,
    };
  }
}
