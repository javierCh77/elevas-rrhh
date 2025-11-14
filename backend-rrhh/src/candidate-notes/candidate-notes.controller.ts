import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CandidateNotesService } from './candidate-notes.service';
import { CreateCandidateNoteDto } from './dto/create-candidate-note.dto';
import { UpdateCandidateNoteDto } from './dto/update-candidate-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('candidate-notes')
@UseGuards(JwtAuthGuard)
export class CandidateNotesController {
  constructor(private readonly candidateNotesService: CandidateNotesService) {}

  @Post()
  create(@Body() createCandidateNoteDto: CreateCandidateNoteDto, @Request() req) {
    return this.candidateNotesService.create(createCandidateNoteDto, req.user);
  }

  @Get()
  findAll() {
    // Get all candidate notes
    return this.candidateNotesService.findAll();
  }

  @Get('by-candidate')
  findByCandidateEmail(@Query('email') candidateEmail: string) {
    if (!candidateEmail) {
      throw new Error('Candidate email is required');
    }
    return this.candidateNotesService.findByCandidateEmail(candidateEmail);
  }

  @Get('batch')
  findByMultipleCandidateEmails(@Query('emails') emails: string) {
    if (!emails) {
      throw new Error('Candidate emails are required');
    }
    const emailArray = emails.split(',').map(email => email.trim()).filter(email => email);
    return this.candidateNotesService.findByMultipleCandidateEmails(emailArray);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateNotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateNoteDto: UpdateCandidateNoteDto, @Request() req) {
    return this.candidateNotesService.update(id, updateCandidateNoteDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.candidateNotesService.remove(id, req.user);
  }
}