import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: { 
        isActive: true, 
        parentId: IsNull() 
      },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoriesRepo.findOne({
      where: { slug: dto.slug },
    });

    if (exists) {
      throw new ConflictException('Bu slug band');
    }

    if (dto.parentId) {
      await this.findById(dto.parentId);
    }

    const category = this.categoriesRepo.create(dto);

    return this.categoriesRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    Object.assign(category, dto);

    return this.categoriesRepo.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findById(id);

    const hasChildren = await this.categoriesRepo.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      throw new ConflictException('Avval ichki kategoriyalarni uchiring');
    }

    await this.categoriesRepo.remove(category);

    return { message: 'Kategoriya uchirildi' };
  }
}