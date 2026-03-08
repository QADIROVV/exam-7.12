import {
  Controller, Get, Patch, Delete,
  Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Mening bildirishnomalarim (MongoDB)' })
  @ApiResponse({ status: 200, description: 'data va unreadCount qaytarildi' })
  findAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Oqilmagan bildirishnomalar soni' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Barchasini oqildi deb belgilash' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirishnomani oqildi deb belgilash' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bildirishnomani uchirish' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.remove(id, userId);
  }
}
