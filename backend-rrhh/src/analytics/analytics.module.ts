import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Application } from '../applications/entities/application.entity';
import { Job } from '../jobs/entities/job.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Interview } from '../interviews/entities/interview.entity';
import { CvAnalysis } from '../eva/entities/cv-analysis.entity';
import { WhatsAppMessage } from '../whatsapp/whatsapp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Job,
      Candidate,
      Interview,
      CvAnalysis,
      WhatsAppMessage,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
