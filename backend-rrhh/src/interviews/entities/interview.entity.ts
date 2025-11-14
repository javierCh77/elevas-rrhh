import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { User } from '../../users/entities/user.entity';

export enum InterviewType {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  TELEFONICA = 'telefonica',
}

export enum InterviewStatus {
  PROGRAMADA = 'programada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'varchar', length: 10 })
  scheduledTime: string; // Format: "HH:MM"

  @Column({ type: 'int', default: 60 })
  durationMinutes: number; // Duration in minutes

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.VIRTUAL,
  })
  type: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.PROGRAMADA,
  })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  location: string; // Physical address or video call link

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  interviewerNotes: string; // Notes taken during/after interview

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 rating

  @Column({ nullable: true })
  interviewerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'interviewerId' })
  interviewer: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;
}
