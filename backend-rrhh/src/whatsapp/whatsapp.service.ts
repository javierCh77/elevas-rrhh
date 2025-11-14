import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage, WhatsAppMessageStatus } from './whatsapp.entity';
import { SendWhatsAppDto, UpdateWhatsAppStatusDto } from './dto/send-whatsapp.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  constructor(
    @InjectRepository(WhatsAppMessage)
    private whatsappRepository: Repository<WhatsAppMessage>,
    private configService: ConfigService,
  ) {}

  /**
   * Send WhatsApp messages via n8n webhook
   * This method saves the messages to the database and sends them to n8n for processing
   */
  async sendMessages(
    sendWhatsAppDto: SendWhatsAppDto,
    userId?: string,
  ): Promise<WhatsAppMessage[]> {
    const { recipients, templateId } = sendWhatsAppDto;

    // Create message records in database
    const messages = recipients.map((recipient) => {
      return this.whatsappRepository.create({
        candidateId: recipient.candidateId,
        phone: recipient.phone,
        message: recipient.message,
        templateId,
        status: WhatsAppMessageStatus.PENDING,
        sentById: userId,
      });
    });

    // Save all messages to database
    const savedMessages = await this.whatsappRepository.save(messages);

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = this.configService.get<string>('N8N_WHATSAPP_WEBHOOK_URL');

    if (n8nWebhookUrl) {
      // Send to n8n for processing
      try {
        const payload = savedMessages.map((msg) => ({
          messageId: msg.id,
          phone: msg.phone,
          message: msg.message,
          candidateId: msg.candidateId,
        }));

        // Call n8n webhook (non-blocking)
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: payload }),
        }).catch((error) => {
          console.error('Error sending to n8n webhook:', error);
        });
      } catch (error) {
        console.error('Error preparing n8n webhook call:', error);
      }
    } else {
      console.warn('N8N_WHATSAPP_WEBHOOK_URL not configured');
    }

    return savedMessages;
  }

  /**
   * Update message status (called by n8n webhook or WhatsApp API)
   */
  async updateMessageStatus(
    updateDto: UpdateWhatsAppStatusDto,
  ): Promise<WhatsAppMessage> {
    const { messageId, status, errorMessage, externalMessageId } = updateDto;

    const message = await this.whatsappRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new BadRequestException(`Message ${messageId} not found`);
    }

    // Update status
    message.status = status as WhatsAppMessageStatus;

    if (errorMessage) {
      message.errorMessage = errorMessage;
    }

    if (externalMessageId) {
      message.externalMessageId = externalMessageId;
    }

    // Update timestamps based on status
    const now = new Date();
    if (status === 'sent' && !message.sentAt) {
      message.sentAt = now;
    } else if (status === 'delivered' && !message.deliveredAt) {
      message.deliveredAt = now;
    } else if (status === 'read' && !message.readAt) {
      message.readAt = now;
    }

    return await this.whatsappRepository.save(message);
  }

  /**
   * Get all messages
   */
  async getAllMessages(
    candidateId?: string,
    status?: WhatsAppMessageStatus,
  ): Promise<WhatsAppMessage[]> {
    const queryBuilder = this.whatsappRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.candidate', 'candidate')
      .leftJoinAndSelect('message.sentBy', 'sentBy')
      .orderBy('message.createdAt', 'DESC');

    if (candidateId) {
      queryBuilder.andWhere('message.candidateId = :candidateId', {
        candidateId,
      });
    }

    if (status) {
      queryBuilder.andWhere('message.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get messages by candidate
   */
  async getMessagesByCandidate(candidateId: string): Promise<WhatsAppMessage[]> {
    return await this.whatsappRepository.find({
      where: { candidateId },
      relations: ['candidate', 'sentBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get message statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }> {
    const total = await this.whatsappRepository.count();
    const pending = await this.whatsappRepository.count({
      where: { status: WhatsAppMessageStatus.PENDING },
    });
    const sent = await this.whatsappRepository.count({
      where: { status: WhatsAppMessageStatus.SENT },
    });
    const delivered = await this.whatsappRepository.count({
      where: { status: WhatsAppMessageStatus.DELIVERED },
    });
    const read = await this.whatsappRepository.count({
      where: { status: WhatsAppMessageStatus.READ },
    });
    const failed = await this.whatsappRepository.count({
      where: { status: WhatsAppMessageStatus.FAILED },
    });

    return { total, pending, sent, delivered, read, failed };
  }
}
