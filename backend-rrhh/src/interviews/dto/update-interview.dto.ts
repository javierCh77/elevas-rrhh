import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewDto } from './create-interview.dto';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsOptional()
  @IsString()
  interviewerNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  cancelledAt?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
