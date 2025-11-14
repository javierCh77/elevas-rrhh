import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { CandidateNotesModule } from './candidate-notes/candidate-notes.module';
import { CandidatesModule } from './candidates/candidates.module';
import { EvaModule } from './eva/eva.module';
import { InterviewsModule } from './interviews/interviews.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting Module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: +configService.get('RATE_LIMIT_WINDOW_MS') || 900000,
          limit: +configService.get('RATE_LIMIT_MAX_REQUESTS') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Feature Modules
    UsersModule,
    AuthModule,
    JobsModule,
    ApplicationsModule,
    CandidatesModule,
    CandidateNotesModule,
    EvaModule,
    InterviewsModule,
    WhatsAppModule,
    AnalyticsModule,
  ],

})
export class AppModule {}
