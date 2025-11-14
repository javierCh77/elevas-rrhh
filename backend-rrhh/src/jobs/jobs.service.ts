import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../users/entities/user.entity';

interface FindAllOptions {
  status?: JobStatus;
  department?: string;
  isPublic?: boolean;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto, user: User): Promise<Job> {
    const job = this.jobRepository.create({
      ...createJobDto,
      createdById: user.id,
      status: JobStatus.DRAFT,
    });

    return await this.jobRepository.save(job);
  }

  async createWithoutUser(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      ...createJobDto,
      // For now, we'll create without user - set a default or null
      createdById: null,
      status: JobStatus.ACTIVE, // Start as active for testing
    });

    return await this.jobRepository.save(job);
  }

  async findAll(options: FindAllOptions = {}): Promise<Job[]> {
    const query = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .orderBy('job.createdAt', 'DESC');

    if (options.status) {
      query.andWhere('job.status = :status', { status: options.status });
    }

    if (options.department) {
      query.andWhere('job.department = :department', { department: options.department });
    }

    if (options.isPublic) {
      query.andWhere('job.status = :activeStatus', { activeStatus: JobStatus.ACTIVE });
    }

    return await query.getMany();
  }

  async findPublicJobs(): Promise<Job[]> {
    return await this.jobRepository.find({
      where: { status: JobStatus.ACTIVE },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Increment view count
    job.incrementViewsCount();
    await this.jobRepository.save(job);

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);

    Object.assign(job, updateJobDto);

    return await this.jobRepository.save(job);
  }

  async publish(id: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only draft jobs can be published');
    }

    job.publish();
    return await this.jobRepository.save(job);
  }

  async pause(id: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException('Only active jobs can be paused');
    }

    job.pause();
    return await this.jobRepository.save(job);
  }

  async activate(id: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.status !== JobStatus.PAUSED) {
      throw new BadRequestException('Only paused jobs can be activated');
    }

    job.resume(); // Use the resume method to reactivate paused jobs
    return await this.jobRepository.save(job);
  }

  async close(id: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.status !== JobStatus.ACTIVE && job.status !== JobStatus.PAUSED) {
      throw new BadRequestException('Only active or paused jobs can be closed');
    }

    job.close();
    return await this.jobRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }
}
