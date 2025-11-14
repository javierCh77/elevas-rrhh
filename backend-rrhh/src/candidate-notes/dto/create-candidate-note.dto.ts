import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateCandidateNoteDto {
  @IsEmail({}, { message: 'Candidate email must be a valid email' })
  @IsNotEmpty({ message: 'Candidate email is required' })
  candidateEmail: string;

  @IsString({ message: 'Candidate first name must be a string' })
  @IsNotEmpty({ message: 'Candidate first name is required' })
  candidateFirstName: string;

  @IsString({ message: 'Candidate last name must be a string' })
  @IsNotEmpty({ message: 'Candidate last name is required' })
  candidateLastName: string;

  @IsString({ message: 'Note content must be a string' })
  @IsNotEmpty({ message: 'Note content is required' })
  content: string;

  @IsOptional()
  @IsString({ message: 'Note type must be a string' })
  @MaxLength(100, { message: 'Note type must not exceed 100 characters' })
  type?: string;
}