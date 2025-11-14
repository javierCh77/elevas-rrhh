import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateNoteDto } from './create-candidate-note.dto';

export class UpdateCandidateNoteDto extends PartialType(CreateCandidateNoteDto) {}