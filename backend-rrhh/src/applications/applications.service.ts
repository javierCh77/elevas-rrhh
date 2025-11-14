import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus, ApplicationSource } from './entities/application.entity';
import { AiSummary } from './entities/ai-summary.entity';
import { Job } from '../jobs/entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CandidatesService } from '../candidates/candidates.service';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

interface FindAllOptions {
  status?: ApplicationStatus;
  jobId?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(AiSummary)
    private readonly aiSummaryRepository: Repository<AiSummary>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly candidatesService: CandidatesService,
  ) {}

  async createWithoutFile(createApplicationDto: CreateApplicationDto): Promise<Application> {
    // Verify job exists
    const job = await this.jobRepository.findOne({
      where: { id: createApplicationDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createApplicationDto.jobId} not found`);
    }

    // Create or find candidate first
    const candidate = await this.candidatesService.findOrCreateFromApplication(createApplicationDto);

    const application = this.applicationRepository.create({
      jobId: createApplicationDto.jobId,
      candidateId: candidate.id,
      coverLetter: createApplicationDto.coverLetter,
      expectedSalary: createApplicationDto.expectedSalary,
      expectedSalaryCurrency: createApplicationDto.expectedSalaryCurrency,
      currentPosition: createApplicationDto.currentPosition,
      currentCompany: createApplicationDto.currentCompany,
      source: createApplicationDto.source || ApplicationSource.WEB_CORPORATIVA,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Increment job applications count
    job.incrementApplicationsCount();
    await this.jobRepository.save(job);

    return await this.findOne(savedApplication.id);
  }

  async create(
    createApplicationDto: CreateApplicationDto,
    cv?: any
  ): Promise<Application> {
    // Verify job exists
    const job = await this.jobRepository.findOne({
      where: { id: createApplicationDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createApplicationDto.jobId} not found`);
    }

    // Handle CV upload if present
    let resumeUrl: string | undefined;
    if (cv) {
      try {
        const uploadDir = join(process.cwd(), 'uploads', 'cvs');
        await mkdir(uploadDir, { recursive: true });

        const filename = `${uuidv4()}-${cv.originalname}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, cv.buffer);
        resumeUrl = `/uploads/cvs/${filename}`;
      } catch (error) {
        // Continue without CV if upload fails
      }
    }

    // Create or find candidate first
    const candidate = await this.candidatesService.findOrCreateFromApplication({
      ...createApplicationDto,
      resumeUrl,
    });

    const application = this.applicationRepository.create({
      jobId: createApplicationDto.jobId,
      candidateId: candidate.id,
      coverLetter: createApplicationDto.coverLetter,
      resumeUrl,
      expectedSalary: createApplicationDto.expectedSalary,
      expectedSalaryCurrency: createApplicationDto.expectedSalaryCurrency,
      currentPosition: createApplicationDto.currentPosition,
      currentCompany: createApplicationDto.currentCompany,
      source: createApplicationDto.source || ApplicationSource.WEB_CORPORATIVA,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Increment job applications count
    job.incrementApplicationsCount();
    await this.jobRepository.save(job);

    return await this.findOne(savedApplication.id);
  }

  async createPublicApplication(
    createApplicationDto: CreateApplicationDto,
    filePath: string
  ): Promise<Application> {
    // Verify job exists
    const job = await this.jobRepository.findOne({
      where: { id: createApplicationDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createApplicationDto.jobId} not found`);
    }

    // Create or find candidate first
    const candidate = await this.candidatesService.findOrCreateFromApplication({
      ...createApplicationDto,
      resumeUrl: filePath,
    });

    // Check if this candidate already applied to this job
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        candidateId: candidate.id,
        jobId: createApplicationDto.jobId,
      },
      relations: ['job'],
    });

    if (existingApplication) {
      throw new BadRequestException({
        message: `Ya has aplicado a este puesto anteriormente.`,
        details: {
          alreadyApplied: true,
          applicationId: existingApplication.id,
          applicationDate: existingApplication.createdAt,
          jobTitle: existingApplication.job?.title,
          currentStatus: existingApplication.status,
          allowUpdate: true,
        }
      });
    }

    const application = this.applicationRepository.create({
      jobId: createApplicationDto.jobId,
      candidateId: candidate.id,
      coverLetter: createApplicationDto.coverLetter,
      resumeUrl: filePath,
      expectedSalary: createApplicationDto.expectedSalary,
      expectedSalaryCurrency: createApplicationDto.expectedSalaryCurrency,
      currentPosition: createApplicationDto.currentPosition,
      currentCompany: createApplicationDto.currentCompany,
      source: ApplicationSource.WEB_CORPORATIVA,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Increment job applications count
    job.incrementApplicationsCount();
    await this.jobRepository.save(job);

    return await this.findOne(savedApplication.id);
  }

  async findAll(options: FindAllOptions = {}): Promise<Application[]> {
    const query = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.reviewedBy', 'reviewedBy')
      .orderBy('application.createdAt', 'DESC');

    if (options.status) {
      query.andWhere('application.status = :status', { status: options.status });
    }

    if (options.jobId) {
      query.andWhere('application.jobId = :jobId', { jobId: options.jobId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate', 'reviewedBy'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async updateWithoutUser(
    id: string,
    updateApplicationDto: UpdateApplicationDto
  ): Promise<Application> {
    const application = await this.findOne(id);
    Object.assign(application, updateApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    user?: any
  ): Promise<Application> {
    const application = await this.findOne(id);

    Object.assign(application, updateApplicationDto);

    if (user && updateApplicationDto.status) {
      application.reviewedBy = user;
      application.reviewedById = user.id;
      application.reviewedAt = new Date();
    }

    return await this.applicationRepository.save(application);
  }

  async review(id: string, user: any, notes?: string): Promise<Application> {
    const application = await this.findOne(id);

    application.review(user, notes);

    return await this.applicationRepository.save(application);
  }

  async reject(id: string, reason?: string, user?: any): Promise<Application> {
    const application = await this.findOne(id);

    application.reject(reason, user);

    return await this.applicationRepository.save(application);
  }

  async hire(id: string): Promise<Application> {
    const application = await this.findOne(id);

    if (application.status !== ApplicationStatus.OFFERED) {
      throw new BadRequestException('Only applications with offer can be hired');
    }

    application.hire();

    return await this.applicationRepository.save(application);
  }

  async updateCv(id: string, newCvUrl: string): Promise<Application> {
    const application = await this.findOne(id);

    // Update application CV
    application.resumeUrl = newCvUrl;
    const updatedApplication = await this.applicationRepository.save(application);

    // Also update candidate's CV if this is the most recent one
    if (application.candidate) {
      application.candidate.resumeUrl = newCvUrl;
      await this.candidatesService.update(application.candidate.id, {
        resumeUrl: newCvUrl,
      });
    }

    return updatedApplication;
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }

  // AI Summary Methods
  async saveAiSummary(
    applicationId: string,
    summaryData: any,
    analyzedById?: string
  ): Promise<AiSummary> {
    // Buscar la aplicación con todas las relaciones
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'job'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Verificar si ya existe un resumen para esta aplicación
    let aiSummary = await this.aiSummaryRepository.findOne({
      where: { applicationId },
    });

    const summaryPayload = {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      analyzedById,
      globalMatch: summaryData.globalMatch,
      experienceMatch: summaryData.experienceMatch,
      educationMatch: summaryData.educationMatch,
      skillsMatch: summaryData.skillsMatch,
      affinityMatch: summaryData.affinityMatch,
      experienceAnalysis: summaryData.experienceAnalysis,
      educationAnalysis: summaryData.educationAnalysis,
      skillsAnalysis: summaryData.skillsAnalysis,
      affinityAnalysis: summaryData.affinityAnalysis,
      synthesis: summaryData.synthesis,
      recommendation: summaryData.recommendation,
      jobTitle: application.job?.title,
      jobDescription: application.job?.description,
      candidateName: `${application.candidate?.firstName} ${application.candidate?.lastName}`,
      candidateEmail: application.candidate?.email,
    };

    if (aiSummary) {
      // Actualizar resumen existente
      Object.assign(aiSummary, summaryPayload);
      return await this.aiSummaryRepository.save(aiSummary);
    } else {
      // Crear nuevo resumen
      aiSummary = this.aiSummaryRepository.create(summaryPayload);
      return await this.aiSummaryRepository.save(aiSummary);
    }
  }

  async getAiSummary(applicationId: string): Promise<AiSummary | null> {
    return await this.aiSummaryRepository.findOne({
      where: { applicationId },
      relations: ['application', 'candidate', 'job', 'analyzedBy'],
    });
  }

  async updateAiSummaryPdfUrl(summaryId: string, pdfUrl: string): Promise<AiSummary> {
    const summary = await this.aiSummaryRepository.findOne({
      where: { id: summaryId },
    });

    if (!summary) {
      throw new NotFoundException(`AI Summary with ID ${summaryId} not found`);
    }

    summary.pdfUrl = pdfUrl;
    return await this.aiSummaryRepository.save(summary);
  }
}
