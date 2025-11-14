import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  JobModality,
  ContractType,
  ExperienceLevel,
  JobStatus,
} from '../entities/job.entity';

export class CreateJobDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsString({ message: 'Responsibilities must be a string' })
  responsibilities?: string;

  @IsOptional()
  @IsString({ message: 'Requirements must be a string' })
  requirements?: string;

  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  benefits?: string;

  @IsString({ message: 'Department must be a string' })
  @IsNotEmpty({ message: 'Department is required' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  department: string;

  @IsString({ message: 'Location must be a string' })
  @IsNotEmpty({ message: 'Location is required' })
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location: string;

  @IsEnum(JobModality, { message: 'Modality must be a valid job modality' })
  @IsNotEmpty({ message: 'Modality is required' })
  modality: JobModality;

  @IsEnum(ContractType, { message: 'Contract type must be a valid contract type' })
  @IsNotEmpty({ message: 'Contract type is required' })
  contractType: ContractType;

  @IsOptional()
  @IsEnum(ExperienceLevel, { message: 'Experience level must be a valid experience level' })
  experienceLevel?: ExperienceLevel;


  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];


  @IsNotEmpty({ message: 'Deadline is required' })
  deadline: string;

  @IsOptional()
  @IsEnum(JobStatus, { message: 'Status must be a valid job status' })
  status?: JobStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be greater than or equal to 0' })
  salaryMin?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be greater than or equal to 0' })
  salaryMax?: number;

  @IsOptional()
  @IsString({ message: 'Salary currency must be a string' })
  @MaxLength(10, { message: 'Salary currency must not exceed 10 characters' })
  salaryCurrency?: string;

  @IsOptional()
  @IsBoolean({ message: 'isUrgent must be a boolean' })
  isUrgent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isRemote must be a boolean' })
  isRemote?: boolean;
}