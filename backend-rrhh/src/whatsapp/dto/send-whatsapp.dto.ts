import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WhatsAppRecipient {
  @IsString()
  @IsNotEmpty()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendWhatsAppDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppRecipient)
  recipients: WhatsAppRecipient[];

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class UpdateWhatsAppStatusDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsNotEmpty()
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  @IsOptional()
  externalMessageId?: string;
}
