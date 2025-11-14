import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  async create(
    createInterviewDto: CreateInterviewDto,
    createdById?: string,
  ): Promise<Interview> {
    const interview = this.interviewRepository.create({
      ...createInterviewDto,
      createdById,
    });

    return await this.interviewRepository.save(interview);
  }

  async findAll(options?: {
    status?: InterviewStatus;
    startDate?: Date;
    endDate?: Date;
    applicationId?: string;
  }): Promise<Interview[]> {
    const queryBuilder = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('interview.interviewer', 'interviewer')
      .leftJoinAndSelect('interview.createdBy', 'createdBy')
      .orderBy('interview.scheduledDate', 'ASC')
      .addOrderBy('interview.scheduledTime', 'ASC');

    if (options?.status) {
      queryBuilder.andWhere('interview.status = :status', {
        status: options.status,
      });
    }

    if (options?.startDate && options?.endDate) {
      queryBuilder.andWhere('interview.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options?.startDate) {
      queryBuilder.andWhere('interview.scheduledDate >= :startDate', {
        startDate: options.startDate,
      });
    } else if (options?.endDate) {
      queryBuilder.andWhere('interview.scheduledDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.applicationId) {
      queryBuilder.andWhere('interview.applicationId = :applicationId', {
        applicationId: options.applicationId,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: [
        'application',
        'application.candidate',
        'application.job',
        'interviewer',
        'createdBy',
      ],
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async findByApplication(applicationId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { applicationId },
      relations: ['interviewer', 'createdBy'],
      order: {
        scheduledDate: 'DESC',
        scheduledTime: 'DESC',
      },
    });
  }

  async update(
    id: string,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    const interview = await this.findOne(id);

    // If marking as completed, set completedAt
    if (
      updateInterviewDto.status === InterviewStatus.COMPLETADA &&
      !interview.completedAt
    ) {
      updateInterviewDto.completedAt = new Date().toISOString();
    }

    // If marking as cancelled, set cancelledAt
    if (
      updateInterviewDto.status === InterviewStatus.CANCELADA &&
      !interview.cancelledAt
    ) {
      updateInterviewDto.cancelledAt = new Date().toISOString();
    }

    Object.assign(interview, updateInterviewDto);

    return await this.interviewRepository.save(interview);
  }

  async cancel(
    id: string,
    cancellationReason?: string,
  ): Promise<Interview> {
    const interview = await this.findOne(id);

    interview.status = InterviewStatus.CANCELADA;
    interview.cancelledAt = new Date();
    if (cancellationReason) {
      interview.cancellationReason = cancellationReason;
    }

    return await this.interviewRepository.save(interview);
  }

  async complete(
    id: string,
    rating?: number,
    interviewerNotes?: string,
  ): Promise<Interview> {
    const interview = await this.findOne(id);

    interview.status = InterviewStatus.COMPLETADA;
    interview.completedAt = new Date();
    if (rating) {
      interview.rating = rating;
    }
    if (interviewerNotes) {
      interview.interviewerNotes = interviewerNotes;
    }

    return await this.interviewRepository.save(interview);
  }

  async remove(id: string): Promise<void> {
    const interview = await this.findOne(id);
    await this.interviewRepository.remove(interview);
  }

  // Get interviews for today
  async getTodayInterviews(): Promise<Interview[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.findAll({
      startDate: today,
      endDate: tomorrow,
      status: InterviewStatus.PROGRAMADA,
    });
  }

  // Get upcoming interviews (next 7 days)
  async getUpcomingInterviews(): Promise<Interview[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return await this.findAll({
      startDate: today,
      endDate: nextWeek,
      status: InterviewStatus.PROGRAMADA,
    });
  }
}
