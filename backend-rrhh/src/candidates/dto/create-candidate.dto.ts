import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsEnum,
} from 'class-validator';

export class CreateCandidateDto {
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
  @IsInt({ message: 'Years of experience must be an integer' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50' })
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  @MaxLength(200, { message: 'LinkedIn URL must not exceed 200 characters' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  @MaxLength(200, { message: 'Portfolio URL must not exceed 200 characters' })
  portfolioUrl?: string;

  @IsOptional()
  @IsString({ message: 'Resume URL must be a string' })
  @MaxLength(500, { message: 'Resume URL must not exceed 500 characters' })
  resumeUrl?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'blacklisted'], {
    message: 'Status must be one of: active, inactive, blacklisted'
  })
  status?: 'active' | 'inactive' | 'blacklisted';

  @IsOptional()
  @IsString({ message: 'Source must be a string' })
  @MaxLength(100, { message: 'Source must not exceed 100 characters' })
  source?: string;
}