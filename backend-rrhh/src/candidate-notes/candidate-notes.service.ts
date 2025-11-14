import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateNote } from './entities/candidate-note.entity';
import { CreateCandidateNoteDto } from './dto/create-candidate-note.dto';
import { UpdateCandidateNoteDto } from './dto/update-candidate-note.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CandidateNotesService {
  constructor(
    @InjectRepository(CandidateNote)
    private readonly candidateNoteRepository: Repository<CandidateNote>,
  ) {}

  async create(createCandidateNoteDto: CreateCandidateNoteDto, user: User): Promise<CandidateNote> {
    const note = this.candidateNoteRepository.create({
      candidateEmail: createCandidateNoteDto.candidateEmail,
      candidateFirstName: createCandidateNoteDto.candidateFirstName,
      candidateLastName: createCandidateNoteDto.candidateLastName,
      content: createCandidateNoteDto.content,
      type: createCandidateNoteDto.type,
      createdBy: user,
    });

    return this.candidateNoteRepository.save(note);
  }

  async findAll(): Promise<CandidateNote[]> {
    return this.candidateNoteRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCandidateEmail(candidateEmail: string): Promise<CandidateNote[]> {
    return this.candidateNoteRepository.find({
      where: { candidateEmail },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CandidateNote> {
    const note = await this.candidateNoteRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!note) {
      throw new NotFoundException(`Candidate note with ID ${id} not found`);
    }

    return note;
  }

  async update(id: string, updateCandidateNoteDto: UpdateCandidateNoteDto, user: User): Promise<CandidateNote> {
    const note = await this.findOne(id);

    // Only allow the creator or admin to update the note
    if (note.createdBy.id !== user.id && user.role !== 'admin') {
      throw new NotFoundException(`You don't have permission to update this note`);
    }

    Object.assign(note, updateCandidateNoteDto);
    return this.candidateNoteRepository.save(note);
  }

  async remove(id: string, user: User): Promise<void> {
    const note = await this.findOne(id);

    // Only allow the creator or admin to delete the note
    if (note.createdBy.id !== user.id && user.role !== 'admin') {
      throw new NotFoundException(`You don't have permission to delete this note`);
    }

    await this.candidateNoteRepository.remove(note);
  }

  // Get notes for multiple candidates at once (useful for batch loading)
  async findByMultipleCandidateEmails(candidateEmails: string[]): Promise<{ [candidateEmail: string]: CandidateNote[] }> {
    const notes = await this.candidateNoteRepository.find({
      where: candidateEmails.map(email => ({ candidateEmail: email })),
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });

    // Group notes by candidate email
    const groupedNotes: { [candidateEmail: string]: CandidateNote[] } = {};
    notes.forEach(note => {
      if (!groupedNotes[note.candidateEmail]) {
        groupedNotes[note.candidateEmail] = [];
      }
      groupedNotes[note.candidateEmail].push(note);
    });

    return groupedNotes;
  }
}