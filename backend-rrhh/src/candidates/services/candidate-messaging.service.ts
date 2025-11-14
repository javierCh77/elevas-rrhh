import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CandidateMessage } from '../entities/candidate-message.entity';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class CandidateMessagingService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateMessage)
    private messageRepository: Repository<CandidateMessage>,
  ) {}

  async sendEmailToCandidate(
    emailData: SendEmailDto,
    sentById?: string,
  ): Promise<CandidateMessage> {
    // Get candidate from database
    const candidate = await this.candidateRepository.findOne({
      where: { id: emailData.candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Replace template variables in subject and body
    const processedSubject = this.replaceTemplateVariables(
      emailData.subject,
      candidate,
      emailData.jobTitle,
    );
    const processedBody = this.replaceTemplateVariables(
      emailData.body,
      candidate,
      emailData.jobTitle,
    );

    let status: 'sent' | 'failed' = 'sent';

    try {
      await this.mailerService.sendMail({
        to: candidate.email,
        subject: processedSubject,
        html: this.formatEmailBody(processedBody),
      });
    } catch (error) {
      status = 'failed';
    }

    // Save message to database
    const message = this.messageRepository.create({
      candidateId: candidate.id,
      sentById: sentById,
      subject: processedSubject,
      body: processedBody,
      template: emailData.template,
      jobTitle: emailData.jobTitle,
      status: status,
      candidateEmail: candidate.email,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (status === 'failed') {
      throw new Error('Failed to send email to candidate');
    }

    return savedMessage;
  }

  async findAll(options?: {
    candidateId?: string;
    limit?: number;
  }): Promise<CandidateMessage[]> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.candidate', 'candidate')
      .leftJoinAndSelect('message.sentBy', 'sentBy')
      .orderBy('message.sentAt', 'DESC');

    if (options?.candidateId) {
      queryBuilder.andWhere('message.candidateId = :candidateId', {
        candidateId: options.candidateId,
      });
    }

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }

    return queryBuilder.getMany();
  }

  private replaceTemplateVariables(
    text: string,
    candidate: Candidate,
    jobTitle?: string,
  ): string {
    let result = text;

    // Replace candidate variables
    result = result.replace(
      /\{\{candidateName\}\}/g,
      `${candidate.firstName} ${candidate.lastName}`,
    );
    result = result.replace(/\{\{firstName\}\}/g, candidate.firstName);
    result = result.replace(/\{\{lastName\}\}/g, candidate.lastName);
    result = result.replace(/\{\{email\}\}/g, candidate.email);

    // Replace job variables
    if (jobTitle) {
      result = result.replace(/\{\{jobTitle\}\}/g, jobTitle);
    }

    // Replace interview placeholder variables with empty string (user should fill these manually)
    result = result.replace(/\{\{interviewDate\}\}/g, '[FECHA A CONFIRMAR]');
    result = result.replace(/\{\{interviewTime\}\}/g, '[HORA A CONFIRMAR]');
    result = result.replace(/\{\{interviewType\}\}/g, '[TIPO A CONFIRMAR]');
    result = result.replace(/\{\{duration\}\}/g, '[DURACIÓN A CONFIRMAR]');
    result = result.replace(/\{\{location\}\}/g, '[UBICACIÓN A CONFIRMAR]');

    // Replace other common variables
    result = result.replace(
      /\{\{recruiterName\}\}/g,
      this.configService.get<string>('RECRUITER_NAME') ||
        'Equipo de Recursos Humanos',
    );
    result = result.replace(
      /\{\{companyName\}\}/g,
      this.configService.get<string>('COMPANY_NAME') || 'Nuestra Empresa',
    );

    // Replace date placeholders with current date
    const today = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    result = result.replace(/\{\{currentDate\}\}/g, today);

    return result;
  }

  private formatEmailBody(body: string): string {
    // Convert plain text to HTML with proper formatting
    const paragraphs = body.split('\n\n');
    const htmlParagraphs = paragraphs
      .map((p) => {
        // Handle line breaks within paragraphs
        const lines = p.split('\n').join('<br>');
        return `<p style="margin: 0 0 16px 0; line-height: 1.6;">${lines}</p>`;
      })
      .join('');

    // Create a nicely formatted HTML email
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <div style="margin-bottom: 15px;">
                        <span style="color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">ELEVAS</span>
                      </div>
                      <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 400; font-style: italic; opacity: 0.95; letter-spacing: 0.5px;">
                        Elevando el talento, transformando el futuro
                      </p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; color: #333333; font-size: 15px;">
                      ${htmlParagraphs}
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px;">
                        Este es un correo electrónico automático, por favor no responder directamente.
                      </p>
                      <p style="margin: 0 0 12px 0;">
                        <a href="https://www.elevasconsulting.com" target="_blank" style="color: #f59e0b; text-decoration: none; font-size: 13px; font-weight: 500;">
                          www.elevasconsulting.com
                        </a>
                      </p>
                      <p style="margin: 0; color: #666666; font-size: 12px;">
                        © ${new Date().getFullYear()} Elevas Consulting. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
