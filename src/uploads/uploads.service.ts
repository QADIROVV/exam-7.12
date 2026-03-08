import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private uploadRoot = join(process.cwd(), 'uploads');

  constructor() {
    ['avatars', 'logos', 'resumes'].forEach((folder) => {
      const dir = join(this.uploadRoot, folder);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });
  }

  makeStorage(subfolder: string) {
    return diskStorage({
      destination: (req, file, cb) => {
        const dir = join(this.uploadRoot, subfolder);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const name = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
        cb(null, name);
      },
    });
  }

  getUrl(subfolder: string, filename: string): string {
    return `/uploads/${subfolder}/${filename}`;
  }

  deleteFile(subfolder: string, filename: string): void {
    const path = join(this.uploadRoot, subfolder, filename);
    if (existsSync(path)) unlinkSync(path);
  }

  validateImage(file: Express.Multer.File): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Faqat JPEG, PNG yoki WEBP rasm yuklanadi');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Rasm 5MB dan oshmasin');
    }
  }

  validateDocument(file: Express.Multer.File): void {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Faqat PDF, DOC yoki DOCX yuklanadi');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Fayl 10MB dan oshmasin');
    }
  }
}
