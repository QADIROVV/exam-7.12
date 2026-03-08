import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepo: Repository<Company>,
  ) {}

  async findAll(search?: string, city?: string, industry?: string): Promise<Company[]> {
    const qb = this.companiesRepo
      .createQueryBuilder('company')
      .where('company.is_active = true');

    if (search)   qb.andWhere('company.name ILIKE :search',       { search: `%${search}%` });
    if (city)     qb.andWhere('company.city = :city',             { city });
    if (industry) qb.andWhere('company.industry = :industry',     { industry });

    return qb.orderBy('company.created_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!company) throw new NotFoundException('Kompaniya topilmadi');
    return company;
  }

  async findBySlug(slug: string): Promise<Company> {
    const company = await this.companiesRepo.findOne({ where: { slug, isActive: true } });
    if (!company) throw new NotFoundException('Kompaniya topilmadi');
    return company;
  }

  async findMine(ownerId: string): Promise<Company[]> {
    return this.companiesRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCompanyDto, ownerId: string): Promise<Company> {
    const exists = await this.companiesRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Bu slug band');
    const company = this.companiesRepo.create({ ...dto, ownerId });
    return this.companiesRepo.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto, userId: string, userRole: UserRole): Promise<Company> {
    const company = await this.findById(id);
    if (company.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Ruxsat yoq');
    }
    Object.assign(company, dto);
    return this.companiesRepo.save(company);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<{ message: string }> {
    const company = await this.findById(id);
    if (company.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Ruxsat yoq');
    }
    await this.companiesRepo.remove(company);
    return { message: 'Kompaniya uchirildi' };
  }
}
