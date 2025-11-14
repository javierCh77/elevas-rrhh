import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';
import { User } from '../users/entities/user.entity';

export enum WhatsAppMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: WhatsAppMessageStatus,
    default: WhatsAppMessageStatus.PENDING,
  })
  status: WhatsAppMessageStatus;

  @Column({ nullable: true })
  templateId: string;

  @Column({ nullable: true })
  externalMessageId: string; // ID from WhatsApp API or n8n

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  sentById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sentById' })
  sentBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;
}
