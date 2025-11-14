import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { User } from '../../users/entities/user.entity';

@Entity('candidate_messages')
export class CandidateMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column({ nullable: true })
  sentById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sentById' })
  sentBy: User;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column()
  template: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({
    type: 'enum',
    enum: ['sent', 'failed', 'draft'],
    default: 'sent',
  })
  status: 'sent' | 'failed' | 'draft';

  @Column({ nullable: true })
  candidateEmail: string;

  @Column({ nullable: true })
  candidateName: string;

  @CreateDateColumn()
  sentAt: Date;
}
