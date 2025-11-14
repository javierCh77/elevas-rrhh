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
  MaxLength,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity('candidate_notes')
export class CandidateNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Candidate information (temporarily keeping old structure)
  @Column()
  @IsNotEmpty({ message: 'Candidate email is required' })
  candidateEmail: string;

  @Column()
  @IsNotEmpty({ message: 'Candidate first name is required' })
  candidateFirstName: string;

  @Column()
  @IsNotEmpty({ message: 'Candidate last name is required' })
  candidateLastName: string;

  // Note content
  @Column('text')
  @IsString({ message: 'Note content must be a string' })
  @IsNotEmpty({ message: 'Note content is required' })
  content: string;

  // Note metadata
  @Column({ nullable: true })
  @MaxLength(100, { message: 'Note type must not exceed 100 characters' })
  type?: string; // e.g., 'interview', 'skills', 'general', 'reference'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // Computed properties
  get candidateFullName(): string {
    return `${this.candidateFirstName} ${this.candidateLastName}`;
  }

  get candidateInitials(): string {
    const firstInitial = this.candidateFirstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = this.candidateLastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
}