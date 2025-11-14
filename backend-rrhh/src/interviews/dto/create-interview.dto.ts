import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { InterviewType, InterviewStatus } from '../entities/interview.entity';

export class CreateInterviewDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string; // ISO date string

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'scheduledTime must be in HH:MM format',
  })
  scheduledTime: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @IsNotEmpty()
  @IsEnum(InterviewType)
  type: InterviewType;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  interviewerId?: string;
}
