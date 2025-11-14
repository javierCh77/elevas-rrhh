import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaController } from './eva.controller';
import { EvaService } from './eva.service';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Application } from '../applications/entities/application.entity';
import { CvAnalysis } from './entities/cv-analysis.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Candidate, Application, CvAnalysis])
  ],
  controllers: [EvaController],
  providers: [EvaService],
  exports: [EvaService],
})
export class EvaModule {}