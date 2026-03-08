import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { VacanciesService } from '../vacancies/vacancies.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { ApplicationStatus } from '../common/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepo: Repository<Application>,
    private vacanciesService: VacanciesService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateApplicationDto, userId: string): Promise<Application> {
    const exists = await this.applicationsRepo.findOne({
      where: { userId, vacancyId: dto.vacancyId },
    });
    if (exists) throw new ConflictException('Siz bu vakansiyaga allaqachon ariza yuborgansiz');

    const vacancy = await this.vacanciesService.findById(dto.vacancyId);
    const app = this.applicationsRepo.create({ ...dto, userId });
    const saved = await this.applicationsRepo.save(app);

    if (vacancy.company?.ownerId) {
      await this.notificationsService.create(
        vacancy.company.ownerId,
        NotificationType.APPLICATION_RECEIVED,
        'Yangi ariza keldi',
        `"${vacancy.title}" vakansiyasiga yangi ariza yuborildi`,
        { applicationId: saved.id, vacancyId: vacancy.id },
      );
    }

    return saved;
  }

  async findMine(userId: string): Promise<Application[]> {
    return this.applicationsRepo.find({
      where: { userId },
      relations: ['vacancy', 'vacancy.company', 'resume'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVacancy(vacancyId: string, userId: string): Promise<Application[]> {
    const vacancy = await this.vacanciesService.findById(vacancyId);
    if (vacancy.company?.ownerId !== userId) {
      throw new ForbiddenException('Bu vakansiya sizga tegishli emas');
    }
    return this.applicationsRepo.find({
      where: { vacancyId },
      relations: ['user', 'resume'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Application> {
    const app = await this.applicationsRepo.findOne({
      where: { id },
      relations: ['user', 'vacancy', 'vacancy.company', 'resume'],
    });
    if (!app) throw new NotFoundException('Ariza topilmadi');
    return app;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto, userId: string): Promise<Application> {
    const app = await this.findById(id);

    if (app.vacancy?.company?.ownerId !== userId) {
      throw new ForbiddenException('Bu ariza sizning vakansiyangizga tegishli emas');
    }

    app.status = dto.status;
    if (dto.employerNote) app.employerNote = dto.employerNote;
    if (dto.status === ApplicationStatus.VIEWED && !app.viewedAt) app.viewedAt = new Date();

    const saved = await this.applicationsRepo.save(app);

    const notifMap: Record<string, { type: NotificationType; title: string; message: string }> = {
      [ApplicationStatus.VIEWED]: {
        type:    NotificationType.APPLICATION_VIEWED,
        title:   'Arizangiz korindi',
        message: `"${app.vacancy.title}" vakansiyasi boyicha arizangizni korishdi`,
      },
      [ApplicationStatus.INVITED]: {
        type:    NotificationType.APPLICATION_INVITED,
        title:   'Intervyuga taklif',
        message: `"${app.vacancy.title}" vakansiyasi boyicha intervyuga taklif qilindingiz`,
      },
      [ApplicationStatus.REJECTED]: {
        type:    NotificationType.APPLICATION_REJECTED,
        title:   'Ariza rad etildi',
        message: `"${app.vacancy.title}" vakansiyasi boyicha arizangiz rad etildi`,
      },
      [ApplicationStatus.HIRED]: {
        type:    NotificationType.APPLICATION_HIRED,
        title:   'Tabriklaymiz!',
        message: `"${app.vacancy.title}" vakansiyasiga qabul qilindingiz`,
      },
    };

    const notif = notifMap[dto.status];
    if (notif) {
      await this.notificationsService.create(
        app.userId, notif.type, notif.title, notif.message,
        { applicationId: id, vacancyId: app.vacancy.id },
      );
    }

    return saved;
  }

  async withdraw(id: string, userId: string): Promise<{ message: string }> {
    const app = await this.findById(id);
    if (app.userId !== userId) throw new ForbiddenException('Ruxsat yoq');
    if (app.status !== ApplicationStatus.PENDING) {
      throw new ForbiddenException('Korib chiqilgan arizani qaytarib bolmaydi');
    }
    await this.applicationsRepo.softDelete(id);
    return { message: 'Ariza qaytarib olindi' };
  }
}
