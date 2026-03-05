import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Profilni ko'rish ────────────────────────────────────────────
  @Get('profile')
  @ApiOperation({ summary: 'O\'z profilini ko\'rish' })
  getProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  // ─── Profilni yangilash ──────────────────────────────────────────
  @Put('profile')
  @ApiOperation({ summary: 'Profilni yangilash' })
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  // ─── Avatar yuklash ──────────────────────────────────────────────
  @Put('avatar')
  @ApiOperation({ summary: 'Avatar yuklash' })
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
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = /jpg|jpeg|png|webp/;
        const ext = allowed.test(extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(ext && mime ? null : new Error('Faqat rasm fayllari ruxsat'), ext && mime);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(userId, avatarPath);
  }

  // ─── Barcha ish beruvchilar ──────────────────────────────────────
  @Get('employers')
  @ApiOperation({ summary: 'Barcha ish beruvchilar ro\'yxati' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAllEmployers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAllEmployers(page, Math.min(limit, 50));
  }

  // ─── Foydalanuvchi profilini ko'rish (public) ────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Foydalanuvchi profilini ko\'rish' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // ─── Hisobni o'chirish ───────────────────────────────────────────
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hisobni o\'chirish' })
  deactivate(@CurrentUser('userId') userId: string) {
    return this.usersService.deactivate(userId);
  }
}
