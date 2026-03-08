import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { CreateResumeDto } from './dto/resume.dto';
import { ResumeStatus } from '../common/enums';

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private resumesRepo: Repository<Resume>,
  ) {}

  async findAll(search?: string, city?: string, experienceLevel?: string): Promise<Resume[]> {
    const qb = this.resumesRepo
      .createQueryBuilder('resume')
      .leftJoinAndSelect('resume.user', 'user')
      .where('resume.status = :status', { status: ResumeStatus.PUBLISHED });

    if (search)          qb.andWhere('(resume.title ILIKE :s OR resume.summary ILIKE :s)', { s: `%${search}%` });
    if (city)            qb.andWhere('resume.city = :city',              { city });
    if (experienceLevel) qb.andWhere('resume.experience_level = :el',   { el: experienceLevel });

    return qb.orderBy('resume.updated_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<Resume> {
    const resume = await this.resumesRepo.findOne({ where: { id }, relations: ['user'] });
    if (!resume) throw new NotFoundException('Rezyume topilmadi');
    return resume;
  }

  async findMine(userId: string): Promise<Resume[]> {
    return this.resumesRepo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async create(dto: CreateResumeDto, userId: string): Promise<Resume> {
    const resume = this.resumesRepo.create({ ...dto, userId });
    return this.resumesRepo.save(resume);
  }

  async update(id: string, dto: CreateResumeDto, userId: string): Promise<Resume> {
    const resume = await this.findById(id);
    if (resume.userId !== userId) throw new ForbiddenException('Ruxsat yoq');
    Object.assign(resume, dto);
    return this.resumesRepo.save(resume);
  }

  async publish(id: string, userId: string): Promise<Resume> {
    const resume = await this.findById(id);
    if (resume.userId !== userId) throw new ForbiddenException('Ruxsat yoq');
    resume.status = ResumeStatus.PUBLISHED;
    return this.resumesRepo.save(resume);
  }

  async hide(id: string, userId: string): Promise<Resume> {
    const resume = await this.findById(id);
    if (resume.userId !== userId) throw new ForbiddenException('Ruxsat yoq');
    resume.status = ResumeStatus.HIDDEN;
    return this.resumesRepo.save(resume);
  }

  async incrementViews(id: string): Promise<void> {
    await this.resumesRepo.increment({ id }, 'viewsCount', 1);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const resume = await this.findById(id);
    if (resume.userId !== userId) throw new ForbiddenException('Ruxsat yoq');
    await this.resumesRepo.softDelete(id);
    return { message: 'Rezyume uchirildi' };
  }
}
