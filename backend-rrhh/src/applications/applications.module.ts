import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { Application } from './entities/application.entity';
import { AiSummary } from './entities/ai-summary.entity';
import { Job } from '../jobs/entities/job.entity';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, AiSummary, Job]),
    CandidatesModule,
  ],
  providers: [ApplicationsService, PdfGeneratorService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
