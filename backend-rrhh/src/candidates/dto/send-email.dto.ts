import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendEmailDto {
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;
}
