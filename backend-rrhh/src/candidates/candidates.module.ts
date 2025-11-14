import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate } from './entities/candidate.entity';
import { CandidateMessage } from './entities/candidate-message.entity';
import { CandidateMessagingService } from './services/candidate-messaging.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, CandidateMessage]),
    AuthModule,
  ],
  providers: [CandidatesService, CandidateMessagingService],
  controllers: [CandidatesController],
  exports: [CandidatesService, CandidateMessagingService],
})
export class CandidatesModule {}