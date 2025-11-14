import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
  IsArray,
} from 'class-validator';
import { Application } from '../../applications/entities/application.entity';
// import { CandidateNote } from '../../candidate-notes/entities/candidate-note.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column()
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @Column()
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Index('IDX_CANDIDATE_EMAIL')
  email: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'DNI must be a string' })
  @MaxLength(20, { message: 'DNI must not exceed 20 characters' })
  dni?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  // Professional Information
  @Column({ nullable: true, type: 'int' })
  @IsOptional()
  yearsOfExperience?: number;

  @Column('text', { array: true, nullable: true })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  skills?: string[];

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'LinkedIn URL must be a string' })
  @MaxLength(200, { message: 'LinkedIn URL must not exceed 200 characters' })
  linkedinUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Portfolio URL must be a string' })
  @MaxLength(200, { message: 'Portfolio URL must not exceed 200 characters' })
  portfolioUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Resume URL must be a string' })
  @MaxLength(500, { message: 'Resume URL must not exceed 500 characters' })
  resumeUrl?: string;

  // Metadata
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'blacklisted';

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Source must be a string' })
  @MaxLength(100, { message: 'Source must not exceed 100 characters' })
  source?: string; // e.g., 'linkedin', 'referral', 'website', 'job_board'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Application, application => application.candidate)
  applications: Application[];

  // @OneToMany(() => CandidateNote, note => note.candidate)
  // notes: CandidateNote[];

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  get experienceDisplay(): string {
    if (!this.yearsOfExperience) return 'No especificado';
    if (this.yearsOfExperience === 1) return '1 año';
    return `${this.yearsOfExperience} años`;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }
}