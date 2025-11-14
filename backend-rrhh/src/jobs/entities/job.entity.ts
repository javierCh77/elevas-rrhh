import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
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
import { User } from '../../users/entities/user.entity';

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

export enum JobModality {
  PRESENCIAL = 'presencial',
  REMOTO = 'remoto',
  HIBRIDO = 'hibrido',
}

export enum ContractType {
  TIEMPO_COMPLETO = 'tiempo_completo',
  TIEMPO_PARCIAL = 'tiempo_parcial',
  CONTRATO_TEMPORAL = 'contrato_temporal',
  FREELANCE = 'freelance',
  PRACTICAS = 'practicas',
}

export enum ExperienceLevel {
  JUNIOR = 'junior',
  SEMI_SENIOR = 'semi_senior',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @Column('text')
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Responsibilities must be a string' })
  responsibilities?: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Requirements must be a string' })
  requirements?: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  benefits?: string;

  @Column()
  @IsString({ message: 'Department must be a string' })
  @IsNotEmpty({ message: 'Department is required' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  department: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location?: string;

  @Column({
    type: 'enum',
    enum: JobModality,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(JobModality, { message: 'Modality must be a valid job modality' })
  modality?: JobModality;

  @Column({
    type: 'enum',
    enum: ContractType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ContractType, { message: 'Contract type must be a valid contract type' })
  contractType?: ContractType;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel, { message: 'Experience level must be a valid experience level' })
  experienceLevel?: ExperienceLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Salary min must be a number' })
  @Min(0, { message: 'Salary min must be positive' })
  salaryMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Salary max must be a number' })
  @Min(0, { message: 'Salary max must be positive' })
  salaryMax?: number;

  @Column({ nullable: true, default: 'EUR' })
  @IsOptional()
  @IsString({ message: 'Salary currency must be a string' })
  @MaxLength(3, { message: 'Salary currency must not exceed 3 characters' })
  salaryCurrency?: string;

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  skills?: string[];

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  @IsEnum(JobStatus, { message: 'Status must be a valid job status' })
  status: JobStatus;

  @Column({ default: false })
  @IsBoolean({ message: 'Is urgent must be a boolean' })
  isUrgent: boolean;

  @Column({ default: false })
  @IsBoolean({ message: 'Is remote must be a boolean' })
  isRemote: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid date' })
  deadline?: Date;

  @Column({ type: 'date', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'date', nullable: true })
  pausedAt?: Date;

  @Column({ type: 'date', nullable: true })
  closedAt?: Date;

  @Column({ default: 0 })
  @IsNumber({}, { message: 'Applications count must be a number' })
  @Min(0, { message: 'Applications count must be positive' })
  applicationsCount: number;

  @Column({ default: 0 })
  @IsNumber({}, { message: 'Views count must be a number' })
  @Min(0, { message: 'Views count must be positive' })
  viewsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column('uuid', { nullable: true })
  createdById?: string;

  // @OneToMany(() => Application, (application) => application.job)
  // applications: Application[];

  // Methods
  get isActive(): boolean {
    return this.status === JobStatus.ACTIVE;
  }

  get isPaused(): boolean {
    return this.status === JobStatus.PAUSED;
  }

  get isClosed(): boolean {
    return this.status === JobStatus.CLOSED;
  }

  get isDraft(): boolean {
    return this.status === JobStatus.DRAFT;
  }

  get isExpired(): boolean {
    return this.deadline ? new Date(this.deadline) < new Date() : false;
  }

  get salaryRange(): string | null {
    if (!this.salaryMin && !this.salaryMax) return null;
    const currency = this.salaryCurrency || 'EUR';

    if (this.salaryMin && this.salaryMax) {
      return `${this.salaryMin} - ${this.salaryMax} ${currency}`;
    }

    if (this.salaryMin) {
      return `Desde ${this.salaryMin} ${currency}`;
    }

    if (this.salaryMax) {
      return `Hasta ${this.salaryMax} ${currency}`;
    }

    return null;
  }

  publish(): void {
    if (this.status === JobStatus.DRAFT) {
      this.status = JobStatus.ACTIVE;
      this.publishedAt = new Date();
    }
  }

  pause(): void {
    if (this.status === JobStatus.ACTIVE) {
      this.status = JobStatus.PAUSED;
      this.pausedAt = new Date();
    }
  }

  resume(): void {
    if (this.status === JobStatus.PAUSED) {
      this.status = JobStatus.ACTIVE;
      this.pausedAt = null;
    }
  }

  close(): void {
    if (this.status === JobStatus.ACTIVE || this.status === JobStatus.PAUSED) {
      this.status = JobStatus.CLOSED;
      this.closedAt = new Date();
    }
  }

  incrementApplicationsCount(): void {
    this.applicationsCount += 1;
  }

  incrementViewsCount(): void {
    this.viewsCount += 1;
  }
}