import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { Resume, ResumeDocument, ResumeStatus } from './schemas/resume.schema';
import { CreateResumeDto, UpdateResumeDto, ResumeQueryDto } from './dto/resume.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  async create(ownerId: string, dto: CreateResumeDto): Promise<ResumeDocument> {
    const resume = new this.resumeModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
      status: ResumeStatus.ACTIVE,
    });

    return resume.save();
  }

  async findAll(query: ResumeQueryDto) {
    const { search, city, skill, page = 1, limit = 20 } = query;

    const filter: FilterQuery<ResumeDocument> = {
      status: ResumeStatus.ACTIVE,
    };

    if (search) filter.$text = { $search: search };

    if (city) filter.city = { $regex: city, $options: 'i' };

    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };

    const skip = (page - 1) * Math.min(limit, 50);
    const safeLimit = Math.min(limit, 50);

    const [data, total] = await Promise.all([
      this.resumeModel
        .find(filter)
        .populate('owner', 'fullName email phone avatar city position')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.resumeModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string): Promise<ResumeDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Rezyume topilmadi');

    const resume = await this.resumeModel
      .findById(id)
      .populate('owner', 'fullName email phone avatar city position')
      .exec();

    if (!resume || resume.status === ResumeStatus.HIDDEN)
      throw new NotFoundException('Rezyume topilmadi');

    await this.resumeModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    return resume;
  }

  async findByOwner(ownerId: string): Promise<ResumeDocument[]> {
    return this.resumeModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateResumeDto,
  ): Promise<ResumeDocument> {
    const resume = await this.resumeModel.findById(id).exec();

    if (!resume) throw new NotFoundException('Rezyume topilmadi');

    if (resume.owner.toString() !== ownerId)
      throw new ForbiddenException('Bu rezyumani yangilash uchun ruxsat yo\'q');

    const updated = await this.resumeModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Rezyume topilmadi');

    return updated;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const resume = await this.resumeModel.findById(id).exec();

    if (!resume) throw new NotFoundException('Rezyume topilmadi');

    if (resume.owner.toString() !== ownerId)
      throw new ForbiddenException('Bu rezyumani o\'chirish uchun ruxsat yo\'q');

    if (resume.filePath) {
      const fullPath = path.join(process.cwd(), resume.filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await this.resumeModel.findByIdAndDelete(id).exec();
  }

  async uploadFile(
    id: string,
    ownerId: string,
    filePath: string,
  ): Promise<ResumeDocument> {
    const resume = await this.resumeModel.findById(id).exec();

    if (!resume) throw new NotFoundException('Rezyume topilmadi');

    if (resume.owner.toString() !== ownerId)
      throw new ForbiddenException('Ruxsat yo\'q');

    if (resume.filePath) {
      const oldPath = path.join(process.cwd(), resume.filePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updated = await this.resumeModel
      .findByIdAndUpdate(id, { filePath }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Rezyume topilmadi');

    return updated;
  }

  async changeStatus(
    id: string,
    ownerId: string,
    status: ResumeStatus,
  ): Promise<ResumeDocument> {
    const resume = await this.resumeModel.findById(id).exec();

    if (!resume) throw new NotFoundException('Rezyume topilmadi');

    if (resume.owner.toString() !== ownerId)
      throw new ForbiddenException('Ruxsat yo\'q');

    const updated = await this.resumeModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Rezyume topilmadi');

    return updated;
  }
}