import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    // Check if candidate with this email already exists
    const existingCandidate = await this.candidateRepository.findOne({
      where: { email: createCandidateDto.email }
    });

    if (existingCandidate) {
      throw new ConflictException(`Candidate with email ${createCandidateDto.email} already exists`);
    }

    const candidate = this.candidateRepository.create(createCandidateDto);
    return this.candidateRepository.save(candidate);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'blacklisted';
    skills?: string[];
  }): Promise<{ candidates: Candidate[]; total: number }> {
    const { page = 1, limit = 10, search, status, skills } = options || {};

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.applications', 'applications')
      .leftJoinAndSelect('applications.job', 'job')
      .orderBy('candidate.createdAt', 'DESC');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('candidate.status = :status', { status });
    }

    // Skills filter
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('candidate.skills && :skills', { skills });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [candidates, total] = await queryBuilder.getManyAndCount();

    return { candidates, total };
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['applications', 'applications.job'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.candidateRepository.findOne({
      where: { email },
      relations: ['applications'],
    });
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);

    // Check if email is being updated and if it conflicts with another candidate
    if (updateCandidateDto.email && updateCandidateDto.email !== candidate.email) {
      const existingCandidate = await this.candidateRepository.findOne({
        where: { email: updateCandidateDto.email }
      });

      if (existingCandidate) {
        throw new ConflictException(`Another candidate with email ${updateCandidateDto.email} already exists`);
      }
    }

    Object.assign(candidate, updateCandidateDto);
    return this.candidateRepository.save(candidate);
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }

  // Helper method to find or create a candidate from application data
  async findOrCreateFromApplication(applicationData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dni?: string;
    location?: string;
    yearsOfExperience?: number;
    skills?: string[];
    resumeUrl?: string;
    source?: string;
  }): Promise<Candidate> {
    let candidate = await this.findByEmail(applicationData.email);

    if (!candidate) {
      // Create new candidate
      candidate = await this.create({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        dni: applicationData.dni,
        location: applicationData.location,
        yearsOfExperience: applicationData.yearsOfExperience,
        skills: applicationData.skills,
        resumeUrl: applicationData.resumeUrl,
        source: applicationData.source || 'application',
      });
    } else {
      // Update existing candidate with new information if provided
      const updateData: Partial<CreateCandidateDto> = {};

      if (applicationData.phone && !candidate.phone) updateData.phone = applicationData.phone;
      if (applicationData.dni && !candidate.dni) updateData.dni = applicationData.dni;
      if (applicationData.location && !candidate.location) updateData.location = applicationData.location;
      if (applicationData.yearsOfExperience && !candidate.yearsOfExperience) {
        updateData.yearsOfExperience = applicationData.yearsOfExperience;
      }
      if (applicationData.skills && applicationData.skills.length > 0) {
        // Merge skills arrays, avoiding duplicates
        const existingSkills = candidate.skills || [];
        const newSkills = applicationData.skills.filter(skill => !existingSkills.includes(skill));
        if (newSkills.length > 0) {
          updateData.skills = [...existingSkills, ...newSkills];
        }
      }
      if (applicationData.resumeUrl && !candidate.resumeUrl) updateData.resumeUrl = applicationData.resumeUrl;

      if (Object.keys(updateData).length > 0) {
        candidate = await this.update(candidate.id, updateData);
      }
    }

    return candidate;
  }

  // Get candidates statistics
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    blacklisted: number;
    recentlyAdded: number;
  }> {
    const [total, active, inactive, blacklisted] = await Promise.all([
      this.candidateRepository.count(),
      this.candidateRepository.count({ where: { status: 'active' } }),
      this.candidateRepository.count({ where: { status: 'inactive' } }),
      this.candidateRepository.count({ where: { status: 'blacklisted' } }),
    ]);

    // Count candidates added in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyAdded = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      total,
      active,
      inactive,
      blacklisted,
      recentlyAdded,
    };
  }
}