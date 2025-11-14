import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  IsEmail,
  IsUrl,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApplicationSource } from '../entities/application.entity';

export class CreateApplicationDto {
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'DNI must be a string' })
  @MaxLength(20, { message: 'DNI must not exceed 20 characters' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Cover letter must be a string' })
  coverLetter?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string;

  @IsOptional()
  @IsEnum(ApplicationSource, { message: 'Source must be a valid application source' })
  source?: ApplicationSource;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  @Min(0, { message: 'Expected salary must be positive' })
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'Expected salary currency must be a string' })
  @MaxLength(3, { message: 'Expected salary currency must not exceed 3 characters' })
  expectedSalaryCurrency?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Years of experience must be a number' })
  @Min(0, { message: 'Years of experience must be positive' })
  @Max(50, { message: 'Years of experience must not exceed 50' })
  yearsOfExperience?: number;

  @IsOptional()
  @IsString({ message: 'Current position must be a string' })
  @MaxLength(100, { message: 'Current position must not exceed 100 characters' })
  currentPosition?: string;

  @IsOptional()
  @IsString({ message: 'Current company must be a string' })
  @MaxLength(100, { message: 'Current company must not exceed 100 characters' })
  currentCompany?: string;

  @IsOptional()
  skills?: string[];

  @IsUUID('4', { message: 'Job ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId: string;

  // Position of interest for general applications
  @IsOptional()
  @IsString({ message: 'Position of interest must be a string' })
  @MaxLength(200, { message: 'Position of interest must not exceed 200 characters' })
  positionOfInterest?: string;
}