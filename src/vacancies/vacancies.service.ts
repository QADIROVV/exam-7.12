import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Vacancy, VacancyDocument, VacancyStatus } from './schemas/vacancy.schema';
import { CreateVacancyDto, UpdateVacancyDto, VacancyQueryDto } from './dto/vacancy.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectModel(Vacancy.name) private vacancyModel: Model<VacancyDocument>,
    private usersService: UsersService,
  ) {}

  async create(employerId: string, dto: CreateVacancyDto): Promise<VacancyDocument> {
    const employer = await this.usersService.findById(employerId);
    if (!employer) throw new NotFoundException('Employer topilmadi');

    const vacancy = new this.vacancyModel({
      ...dto,
      employer: new Types.ObjectId(employerId),
      companyName: dto.companyName || employer.companyName || employer.fullName,
      status: VacancyStatus.ACTIVE,
    });

    return vacancy.save();
  }

  async findAll(query: VacancyQueryDto) {
    const {
      search,
      city,
      employmentType,
      experienceLevel,
      category,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    // Mongoose 7 bilan mos: FilterQuery tipini mongoose.FilterQuery orqali ishlatamiz
    const filter: mongoose.QueryFilter<VacancyDocument> = {
      status: VacancyStatus.ACTIVE,
    };

    if (search) {
      filter.$text = { $search: search };
    }
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (employmentType) filter.employmentType = employmentType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (category) filter.category = { $regex: category, $options: 'i' };

    if (salaryMin !== undefined || salaryMax !== undefined) {
      filter.$or = [];
      if (salaryMin !== undefined) filter.$or.push({ salaryMax: { $gte: salaryMin } });
      if (salaryMax !== undefined) filter.$or.push({ salaryMin: { $lte: salaryMax } });
      if (filter.$or.length === 0) delete filter.$or;
    }

    const skip = (page - 1) * Math.min(limit, 50);
    const safeLimit = Math.min(limit, 50);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.vacancyModel
        .find(filter)
        .populate('employer', 'fullName companyName avatar email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.vacancyModel.countDocuments(filter),
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

  async findOne(id: string): Promise<VacancyDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Vakansiya topilmadi');

    const vacancy = await this.vacancyModel
      .findById(id)
      .populate('employer', 'fullName companyName avatar email phone website')
      .exec();

    if (!vacancy) throw new NotFoundException('Vakansiya topilmadi');

    await this.vacancyModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    return vacancy;
  }

  async findByEmployer(employerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.vacancyModel
        .find({ employer: new Types.ObjectId(employerId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.vacancyModel.countDocuments({ employer: new Types.ObjectId(employerId) }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async update(id: string, employerId: string, dto: UpdateVacancyDto): Promise<VacancyDocument> {
    const vacancy = await this.vacancyModel.findById(id).exec();
    if (!vacancy) throw new NotFoundException('Vakansiya topilmadi');

    if (vacancy.employer.toString() !== employerId) throw new ForbiddenException('Ruxsat yo‘q');

    const updated = await this.vacancyModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Vakansiya yangilanmadi');

    return updated;
  }

  async remove(id: string, employerId: string): Promise<void> {
    const vacancy = await this.vacancyModel.findById(id).exec();
    if (!vacancy) throw new NotFoundException('Vakansiya topilmadi');

    if (vacancy.employer.toString() !== employerId) throw new ForbiddenException('Ruxsat yo‘q');

    await this.vacancyModel.findByIdAndDelete(id).exec();
  }

  async changeStatus(id: string, employerId: string, status: VacancyStatus): Promise<VacancyDocument> {
    const vacancy = await this.vacancyModel.findById(id).exec();
    if (!vacancy) throw new NotFoundException('Vakansiya topilmadi');

    if (vacancy.employer.toString() !== employerId) throw new ForbiddenException('Ruxsat yo‘q');

    const updated = await this.vacancyModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Status o‘zgarmadi');

    return updated;
  }

  async getStats(employerId: string) {
    return this.vacancyModel.aggregate([
      { $match: { employer: new Types.ObjectId(employerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalApplications: { $sum: '$applications' },
        },
      },
    ]);
  }

  async findSimilar(id: string, limit = 5): Promise<VacancyDocument[]> {
    const vacancy = await this.vacancyModel.findById(id).exec();
    if (!vacancy) return [];

    return this.vacancyModel
      .find({
        _id: { $ne: vacancy._id },
        status: VacancyStatus.ACTIVE,
        $or: [{ category: vacancy.category }, { city: vacancy.city }],
      })
      .limit(limit)
      .exec();
  }
}