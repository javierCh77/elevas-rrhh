import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
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
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum ApplicationSource {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  REFERIDOS = 'referidos',
  WEB_CORPORATIVA = 'web_corporativa',
  OTROS = 'otros',
}

@Entity('applications')
@Unique(['candidateId', 'jobId']) // Prevent duplicate applications
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Cover letter must be a string' })
  coverLetter?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Resume URL must be a valid URL' })
  resumeUrl?: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  @IsEnum(ApplicationStatus, { message: 'Status must be a valid application status' })
  status: ApplicationStatus;

  @Column({
    type: 'enum',
    enum: ApplicationSource,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ApplicationSource, { message: 'Source must be a valid application source' })
  source?: ApplicationSource;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  @Min(0, { message: 'Expected salary must be positive' })
  expectedSalary?: number;

  @Column({ nullable: true, default: 'EUR' })
  @IsOptional()
  @IsString({ message: 'Expected salary currency must be a string' })
  @MaxLength(3, { message: 'Expected salary currency must not exceed 3 characters' })
  expectedSalaryCurrency?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Current position must be a string' })
  @MaxLength(100, { message: 'Current position must not exceed 100 characters' })
  currentPosition?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Current company must be a string' })
  @MaxLength(100, { message: 'Current company must not exceed 100 characters' })
  currentCompany?: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Rejection reason must be a string' })
  rejectionReason?: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  rating?: number;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  interviewScheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  interviewedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  offeredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  hiredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  withdrawnAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Candidate, candidate => candidate.applications)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column('uuid', { nullable: true })
  candidateId?: string;

  @ManyToOne(() => Job, (job) => job.id)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('uuid')
  jobId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User;

  @Column('uuid', { nullable: true })
  reviewedById?: string;

  // Methods
  get fullName(): string {
    return this.candidate ? this.candidate.fullName : '';
  }

  get initials(): string {
    return this.candidate ? this.candidate.initials : '';
  }

  get expectedSalaryFormatted(): string | null {
    if (!this.expectedSalary) return null;
    const currency = this.expectedSalaryCurrency || 'EUR';
    return `${this.expectedSalary} ${currency}`;
  }

  get isPending(): boolean {
    return this.status === ApplicationStatus.PENDING;
  }

  get isReviewed(): boolean {
    return this.status === ApplicationStatus.REVIEWED;
  }

  get isRejected(): boolean {
    return this.status === ApplicationStatus.REJECTED;
  }

  get isHired(): boolean {
    return this.status === ApplicationStatus.HIRED;
  }

  get isWithdrawn(): boolean {
    return this.status === ApplicationStatus.WITHDRAWN;
  }

  review(reviewedBy: User, notes?: string): void {
    this.status = ApplicationStatus.REVIEWED;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewedBy;
    this.reviewedById = reviewedBy.id;
    if (notes) {
      this.notes = notes;
    }
  }

  scheduleInterview(): void {
    this.status = ApplicationStatus.INTERVIEW_SCHEDULED;
    this.interviewScheduledAt = new Date();
  }

  markAsInterviewed(): void {
    this.status = ApplicationStatus.INTERVIEWED;
    this.interviewedAt = new Date();
  }

  makeOffer(): void {
    this.status = ApplicationStatus.OFFERED;
    this.offeredAt = new Date();
  }

  hire(): void {
    this.status = ApplicationStatus.HIRED;
    this.hiredAt = new Date();
  }

  reject(reason?: string, reviewedBy?: User): void {
    this.status = ApplicationStatus.REJECTED;
    this.rejectedAt = new Date();
    if (reason) {
      this.rejectionReason = reason;
    }
    if (reviewedBy) {
      this.reviewedBy = reviewedBy;
      this.reviewedById = reviewedBy.id;
    }
  }

  withdraw(): void {
    this.status = ApplicationStatus.WITHDRAWN;
    this.withdrawnAt = new Date();
  }
}