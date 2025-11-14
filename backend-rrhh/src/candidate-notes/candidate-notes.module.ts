import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateNotesService } from './candidate-notes.service';
import { CandidateNotesController } from './candidate-notes.controller';
import { CandidateNote } from './entities/candidate-note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateNote]),
  ],
  providers: [CandidateNotesService],
  controllers: [CandidateNotesController],
  exports: [CandidateNotesService],
})
export class CandidateNotesModule {}