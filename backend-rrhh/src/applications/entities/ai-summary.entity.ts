import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Job } from '../../jobs/entities/job.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ai_summaries')
export class AiSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones
  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column()
  applicationId: string;

  @ManyToOne(() => Candidate, { nullable: false })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column()
  candidateId: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  jobId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'analyzedById' })
  analyzedBy: User;

  @Column({ nullable: true })
  analyzedById: string;

  // Datos del análisis
  @Column({ type: 'int' })
  globalMatch: number;

  @Column({ type: 'int' })
  experienceMatch: number;

  @Column({ type: 'int' })
  educationMatch: number;

  @Column({ type: 'int' })
  skillsMatch: number;

  @Column({ type: 'int' })
  affinityMatch: number;

  // Análisis detallados (JSON)
  @Column({ type: 'jsonb', nullable: true })
  experienceAnalysis: {
    match: number;
    relevant: Array<{
      company: string;
      period: string;
      role: string;
      relevance: string;
    }>;
    comment: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  educationAnalysis: {
    match: number;
    degrees: string[];
    comment: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  skillsAnalysis: {
    match: number;
    cvSkills: string[];
    requiredSkills: string[];
    comment: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  affinityAnalysis: {
    match: number;
    comment: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  synthesis: {
    totalScore: number;
    breakdown: Array<{
      area: string;
      weight: number;
      score: number;
    }>;
  };

  @Column({ type: 'text' })
  recommendation: string;

  // URL del PDF generado
  @Column({ nullable: true })
  pdfUrl: string;

  // Metadata
  @Column({ type: 'text', nullable: true })
  jobTitle: string;

  @Column({ type: 'text', nullable: true })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  candidateName: string;

  @Column({ type: 'text', nullable: true })
  candidateEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
