import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/vacancy.dto';
import { CompaniesService } from '../companies/companies.service';
import { VacancyStatus, UserRole } from '../common/enums';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacanciesRepo: Repository<Vacancy>,
    private companiesService: CompaniesService,
  ) {}

  async findAll(
    search?: string,
    city?: string,
    employmentType?: string,
    experienceLevel?: string,
    categoryId?: string,
    companyId?: string,
    isRemote?: boolean,
  ): Promise<Vacancy[]> {
    const qb = this.vacanciesRepo
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.company', 'company')
      .leftJoinAndSelect('vacancy.category', 'category')
      .where('vacancy.status = :status', { status: VacancyStatus.PUBLISHED });

    if (search)         qb.andWhere('(vacancy.title ILIKE :s OR vacancy.description ILIKE :s)', { s: `%${search}%` });
    if (city)           qb.andWhere('vacancy.city = :city',                         { city });
    if (employmentType) qb.andWhere('vacancy.employment_type = :et',                { et: employmentType });
    if (experienceLevel)qb.andWhere('vacancy.experience_level = :el',               { el: experienceLevel });
    if (categoryId)     qb.andWhere('vacancy.category_id = :categoryId',            { categoryId });
    if (companyId)      qb.andWhere('vacancy.company_id = :companyId',              { companyId });
    if (isRemote !== undefined) qb.andWhere('vacancy.is_remote = :isRemote',        { isRemote });

    return qb.orderBy('vacancy.published_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<Vacancy> {
    const vacancy = await this.vacanciesRepo.findOne({
      where: { id },
      relations: ['company', 'category'],
    });
    if (!vacancy) throw new NotFoundException('Vakansiya topilmadi');
    return vacancy;
  }

  async findByCompany(companyId: string): Promise<Vacancy[]> {
    return this.vacanciesRepo.find({
      where: { companyId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateVacancyDto, userId: string): Promise<Vacancy> {
    const company = await this.companiesService.findById(dto.companyId);
    if (company.ownerId !== userId) {
      throw new ForbiddenException('Bu kompaniya sizga tegishli emas');
    }
    if (dto.salaryMin && dto.salaryMax && dto.salaryMin > dto.salaryMax) {
      throw new BadRequestException('Minimal maosh maksimaldan katta bolmasin');
    }
    const vacancy = this.vacanciesRepo.create(dto);
    return this.vacanciesRepo.save(vacancy);
  }

  async update(id: string, dto: UpdateVacancyDto, userId: string): Promise<Vacancy> {
    const vacancy = await this.findById(id);
    const company = await this.companiesService.findById(vacancy.companyId);
    if (company.ownerId !== userId) throw new ForbiddenException('Ruxsat yoq');
    Object.assign(vacancy, dto);
    return this.vacanciesRepo.save(vacancy);
  }

  async publish(id: string, userId: string): Promise<Vacancy> {
    const vacancy = await this.findById(id);
    const company = await this.companiesService.findById(vacancy.companyId);
    if (company.ownerId !== userId) throw new ForbiddenException('Ruxsat yoq');
    vacancy.status      = VacancyStatus.PUBLISHED;
    vacancy.publishedAt = new Date();
    return this.vacanciesRepo.save(vacancy);
  }

  async close(id: string, userId: string): Promise<Vacancy> {
    const vacancy = await this.findById(id);
    const company = await this.companiesService.findById(vacancy.companyId);
    if (company.ownerId !== userId) throw new ForbiddenException('Ruxsat yoq');
    vacancy.status = VacancyStatus.CLOSED;
    return this.vacanciesRepo.save(vacancy);
  }

  async incrementViews(id: string): Promise<void> {
    await this.vacanciesRepo.increment({ id }, 'viewsCount', 1);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<{ message: string }> {
    const vacancy = await this.findById(id);
    const company = await this.companiesService.findById(vacancy.companyId);
    if (company.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Ruxsat yoq');
    }
    await this.vacanciesRepo.softDelete(id);
    return { message: 'Vakansiya uchirildi' };
  }
}
