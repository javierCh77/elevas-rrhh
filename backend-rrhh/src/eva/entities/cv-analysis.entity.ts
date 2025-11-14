import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Application } from '../../applications/entities/application.entity';
import { User } from '../../users/entities/user.entity';

export enum AnalysisRecommendation {
  STRONG_FIT = 'strong_fit',
  GOOD_FIT = 'good_fit',
  MODERATE_FIT = 'moderate_fit',
  POOR_FIT = 'poor_fit',
}

@Entity('cv_analyses')
export class CvAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CV Information
  @Column()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  // Analysis Prompt
  @Column('text', { nullable: true })
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  analyzedPosition?: string;

  // AI Analysis Results
  @Column({ type: 'int' })
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  skillsMatch: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  experienceMatch: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  educationMatch: number;

  @Column('text', { array: true, default: [] })
  @IsOptional()
  @IsArray()
  skillsFound: string[];

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @Column('text', { array: true, default: [] })
  @IsOptional()
  @IsArray()
  redFlags: string[];

  @Column('text', { array: true, default: [] })
  @IsOptional()
  @IsArray()
  strengths: string[];

  @Column({
    type: 'enum',
    enum: AnalysisRecommendation,
    default: AnalysisRecommendation.MODERATE_FIT,
  })
  @IsEnum(AnalysisRecommendation)
  recommendation: AnalysisRecommendation;

  // AI Metadata
  @Column('jsonb', { nullable: true })
  rawAnalysis?: any;

  @Column({ default: true })
  aiGenerated: boolean;

  @Column({ default: false })
  realContent: boolean;

  // User Feedback
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  userRating?: number;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString()
  userFeedback?: string;

  @Column({ type: 'timestamp', nullable: true })
  feedbackAt?: Date;

  // Relations
  @ManyToOne(() => Candidate, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  candidate?: Candidate;

  @Column('uuid', { nullable: true })
  candidateId?: string;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'applicationId' })
  application?: Application;

  @Column('uuid', { nullable: true })
  applicationId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'analyzedById' })
  analyzedBy?: User;

  @Column('uuid', { nullable: true })
  analyzedById?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get scoreColor(): string {
    if (this.overallScore >= 85) return 'text-green-600';
    if (this.overallScore >= 70) return 'text-blue-600';
    if (this.overallScore >= 55) return 'text-yellow-600';
    return 'text-red-600';
  }

  get hasUserFeedback(): boolean {
    return !!this.userRating || !!this.userFeedback;
  }

  get analysisAge(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} día${diffDays > 1 ? 's' : ''} atrás`;
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return 'Reciente';
  }
}