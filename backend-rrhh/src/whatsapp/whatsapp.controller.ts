import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendWhatsAppDto, UpdateWhatsAppStatusDto } from './dto/send-whatsapp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppMessageStatus } from './whatsapp.entity';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * Send WhatsApp messages
   * POST /whatsapp/send
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessages(@Body() sendWhatsAppDto: SendWhatsAppDto, @Req() req: any) {
    const userId = req.user?.userId;
    return await this.whatsappService.sendMessages(sendWhatsAppDto, userId);
  }

  /**
   * Update message status (webhook from n8n or WhatsApp API)
   * POST /whatsapp/status
   */
  @Post('status')
  async updateStatus(@Body() updateDto: UpdateWhatsAppStatusDto) {
    return await this.whatsappService.updateMessageStatus(updateDto);
  }

  /**
   * Get all messages with optional filters
   * GET /whatsapp/messages
   */
  @Get('messages')
  @UseGuards(JwtAuthGuard)
  async getAllMessages(
    @Query('candidateId') candidateId?: string,
    @Query('status') status?: WhatsAppMessageStatus,
  ) {
    return await this.whatsappService.getAllMessages(candidateId, status);
  }

  /**
   * Get messages by candidate
   * GET /whatsapp/candidate/:candidateId
   */
  @Get('candidate/:candidateId')
  @UseGuards(JwtAuthGuard)
  async getMessagesByCandidate(@Param('candidateId') candidateId: string) {
    return await this.whatsappService.getMessagesByCandidate(candidateId);
  }

  /**
   * Get message statistics
   * GET /whatsapp/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    return await this.whatsappService.getStatistics();
  }
}
