import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Application, ApplicationStatus } from '../applications/entities/application.entity';
import { Job, JobStatus } from '../jobs/entities/job.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Interview, InterviewStatus } from '../interviews/entities/interview.entity';
import { CvAnalysis } from '../eva/entities/cv-analysis.entity';
import { WhatsAppMessage } from '../whatsapp/whatsapp.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(CvAnalysis)
    private cvAnalysisRepository: Repository<CvAnalysis>,
    @InjectRepository(WhatsAppMessage)
    private whatsappRepository: Repository<WhatsAppMessage>,
  ) {}

  async getDashboardAnalytics(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      kpis,
      funnel,
      departmentStats,
      alerts,
      sourceEffectiveness,
    ] = await Promise.all([
      this.getKPIs('month'),
      this.getRecruitmentFunnel(start.toISOString(), end.toISOString()),
      this.getDepartmentStats(),
      this.getAlerts(),
      this.getSourceEffectiveness(),
    ]);

    return {
      success: true,
      data: {
        kpis,
        funnel,
        departmentStats,
        alerts,
        sourceEffectiveness,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    };
  }

  async getKPIs(period: string = 'month') {
    const now = new Date();
    const periodDays = this.getPeriodDays(period);
    const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Current period data
    const [
      currentApplications,
      currentHired,
      previousApplications,
      previousHired,
      totalCandidates,
      activeCandidates,
      openJobs,
      urgentJobs,
      todayInterviews,
      aiAnalyses,
    ] = await Promise.all([
      this.applicationRepository.count({
        where: { createdAt: MoreThan(currentStart) },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.HIRED,
          hiredAt: MoreThan(currentStart),
        },
      }),
      this.applicationRepository.count({
        where: {
          createdAt: Between(previousStart, currentStart),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.HIRED,
          hiredAt: Between(previousStart, currentStart),
        },
      }),
      this.candidateRepository.count(),
      this.candidateRepository.count({
        where: { status: 'active' },
      }),
      this.jobRepository.count({
        where: { status: JobStatus.ACTIVE },
      }),
      this.jobRepository.count({
        where: { status: JobStatus.ACTIVE, isUrgent: true },
      }),
      this.getTodayInterviewsCount(),
      this.cvAnalysisRepository.count({
        where: { createdAt: MoreThan(currentStart) },
      }),
    ]);

    // Time to hire calculation
    const timeToHire = await this.calculateTimeToHire(currentStart);
    const previousTimeToHire = await this.calculateTimeToHire(previousStart, currentStart);

    // Conversion rates
    const conversionRate = currentApplications > 0
      ? ((currentHired / currentApplications) * 100).toFixed(1)
      : '0.0';

    const previousConversionRate = previousApplications > 0
      ? ((previousHired / previousApplications) * 100).toFixed(1)
      : '0.0';

    // Calculate changes
    const applicationChange = this.calculatePercentageChange(currentApplications, previousApplications);
    const hiredChange = this.calculatePercentageChange(currentHired, previousHired);
    const timeToHireChange = previousTimeToHire > 0
      ? timeToHire - previousTimeToHire
      : 0;
    const conversionRateChange = parseFloat(conversionRate) - parseFloat(previousConversionRate);

    return {
      timeToHire: {
        value: timeToHire,
        change: timeToHireChange,
        trend: timeToHireChange <= 0 ? 'up' : 'down', // Lower is better
        unit: 'días',
      },
      applications: {
        value: currentApplications,
        change: applicationChange,
        trend: applicationChange >= 0 ? 'up' : 'down',
      },
      hired: {
        value: currentHired,
        change: hiredChange,
        trend: hiredChange >= 0 ? 'up' : 'down',
      },
      conversionRate: {
        value: parseFloat(conversionRate),
        change: conversionRateChange,
        trend: conversionRateChange >= 0 ? 'up' : 'down',
        unit: '%',
      },
      candidates: {
        total: totalCandidates,
        active: activeCandidates,
      },
      jobs: {
        open: openJobs,
        urgent: urgentJobs,
      },
      interviews: {
        today: todayInterviews,
      },
      aiAnalyses: {
        period: aiAnalyses,
      },
    };
  }

  async getRecruitmentFunnel(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [
      totalApplications,
      reviewed,
      interviewScheduled,
      interviewed,
      offered,
      hired,
      rejected,
    ] = await Promise.all([
      this.applicationRepository.count({
        where: { createdAt: Between(start, end) },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.REVIEWED,
          createdAt: Between(start, end),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.INTERVIEW_SCHEDULED,
          createdAt: Between(start, end),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.INTERVIEWED,
          createdAt: Between(start, end),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.OFFERED,
          createdAt: Between(start, end),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.HIRED,
          createdAt: Between(start, end),
        },
      }),
      this.applicationRepository.count({
        where: {
          status: ApplicationStatus.REJECTED,
          createdAt: Between(start, end),
        },
      }),
    ]);

    const calculateConversion = (current: number, previous: number) => {
      return previous > 0 ? ((current / previous) * 100).toFixed(1) : '0.0';
    };

    return {
      stages: [
        {
          name: 'Applications',
          count: totalApplications,
          percentage: 100,
          conversion: '100.0',
        },
        {
          name: 'Reviewed',
          count: reviewed,
          percentage: totalApplications > 0 ? (reviewed / totalApplications) * 100 : 0,
          conversion: calculateConversion(reviewed, totalApplications),
        },
        {
          name: 'Interview Scheduled',
          count: interviewScheduled,
          percentage: totalApplications > 0 ? (interviewScheduled / totalApplications) * 100 : 0,
          conversion: calculateConversion(interviewScheduled, reviewed),
        },
        {
          name: 'Interviewed',
          count: interviewed,
          percentage: totalApplications > 0 ? (interviewed / totalApplications) * 100 : 0,
          conversion: calculateConversion(interviewed, interviewScheduled),
        },
        {
          name: 'Offered',
          count: offered,
          percentage: totalApplications > 0 ? (offered / totalApplications) * 100 : 0,
          conversion: calculateConversion(offered, interviewed),
        },
        {
          name: 'Hired',
          count: hired,
          percentage: totalApplications > 0 ? (hired / totalApplications) * 100 : 0,
          conversion: calculateConversion(hired, offered),
        },
      ],
      rejected,
      totalConversionRate: totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : '0.0',
    };
  }

  async getDepartmentStats() {
    const jobs = await this.jobRepository.find();
    const applications = await this.applicationRepository.find({
      relations: ['job'],
    });

    const departmentMap = new Map<string, any>();

    for (const job of jobs) {
      const dept = job.department || 'Sin Departamento';

      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          activeJobs: 0,
          totalApplications: 0,
          hired: 0,
          avgTimeToHire: 0,
          conversionRate: 0,
        });
      }

      const stats = departmentMap.get(dept);

      if (job.status === JobStatus.ACTIVE) {
        stats.activeJobs++;
      }
    }

    // Count applications and hires per department
    for (const app of applications) {
      const dept = app.job?.department || 'Sin Departamento';

      if (departmentMap.has(dept)) {
        const stats = departmentMap.get(dept);
        stats.totalApplications++;
        if (app.status === ApplicationStatus.HIRED) {
          stats.hired++;
        }
      }
    }

    // Calculate averages and conversion rates
    const departments = Array.from(departmentMap.values()).map(dept => {
      dept.conversionRate = dept.totalApplications > 0
        ? ((dept.hired / dept.totalApplications) * 100).toFixed(1)
        : '0.0';

      return dept;
    });

    return departments.sort((a, b) => b.totalApplications - a.totalApplications);
  }

  async getTimeSeries(metric: string, period: string, months: number = 6) {
    const now = new Date();
    const dataPoints = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      let value = 0;

      switch (metric) {
        case 'applications':
          value = await this.applicationRepository.count({
            where: { createdAt: Between(start, end) },
          });
          break;
        case 'hired':
          value = await this.applicationRepository.count({
            where: { status: ApplicationStatus.HIRED, hiredAt: Between(start, end) },
          });
          break;
        case 'timeToHire':
          value = await this.calculateTimeToHire(start, end);
          break;
        case 'jobs':
          value = await this.jobRepository.count({
            where: { publishedAt: Between(start, end) },
          });
          break;
      }

      dataPoints.push({
        date: start.toISOString().split('T')[0],
        month: start.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        value,
      });
    }

    return dataPoints;
  }

  async getAlerts() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const alerts = [];

    // Pending applications > 7 days
    const oldPendingApps = await this.applicationRepository.count({
      where: {
        status: ApplicationStatus.PENDING,
        createdAt: LessThan(sevenDaysAgo),
      },
    });

    if (oldPendingApps > 0) {
      alerts.push({
        type: 'urgent',
        category: 'recruitment',
        title: `${oldPendingApps} aplicaciones sin revisar`,
        description: `Hay ${oldPendingApps} aplicaciones pendientes de revisión hace más de 7 días`,
        priority: 'high',
        count: oldPendingApps,
      });
    }

    // Urgent jobs with few applications
    const urgentJobs = await this.jobRepository.find({
      where: { status: JobStatus.ACTIVE, isUrgent: true },
    });

    const urgentWithFewApps = [];
    for (const job of urgentJobs) {
      const appCount = await this.applicationRepository.count({
        where: { jobId: job.id },
      });
      if (appCount < 5) {
        urgentWithFewApps.push(job);
      }
    }

    if (urgentWithFewApps.length > 0) {
      alerts.push({
        type: 'urgent',
        category: 'recruitment',
        title: `${urgentWithFewApps.length} puestos urgentes con pocas aplicaciones`,
        description: `Puestos urgentes con menos de 5 aplicaciones`,
        priority: 'high',
        count: urgentWithFewApps.length,
      });
    }

    // Jobs near deadline
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const jobsNearDeadline = await this.jobRepository.count({
      where: {
        status: JobStatus.ACTIVE,
        deadline: Between(now, sevenDaysAhead),
      },
    });

    if (jobsNearDeadline > 0) {
      alerts.push({
        type: 'warning',
        category: 'process',
        title: `${jobsNearDeadline} puestos próximos a deadline`,
        description: `Puestos que cierran en los próximos 7 días`,
        priority: 'medium',
        count: jobsNearDeadline,
      });
    }

    // High-score candidates not contacted
    const highScoreCandidates = await this.cvAnalysisRepository.count({
      where: {
        overallScore: MoreThan(80),
      },
    });

    if (highScoreCandidates > 0) {
      alerts.push({
        type: 'opportunity',
        category: 'performance',
        title: `${highScoreCandidates} candidatos de alto potencial`,
        description: `Candidatos con score de IA > 80`,
        priority: 'low',
        count: highScoreCandidates,
      });
    }

    return alerts;
  }

  async getSourceEffectiveness() {
    const applications = await this.applicationRepository.find({
      select: ['source', 'status'],
    });

    const sourceMap = new Map<string, any>();

    for (const app of applications) {
      const source = app.source || 'otros';

      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          source,
          total: 0,
          hired: 0,
          conversionRate: 0,
        });
      }

      const stats = sourceMap.get(source);
      stats.total++;
      if (app.status === ApplicationStatus.HIRED) {
        stats.hired++;
      }
    }

    const sources = Array.from(sourceMap.values()).map(src => {
      src.conversionRate = src.total > 0
        ? ((src.hired / src.total) * 100).toFixed(1)
        : '0.0';
      return src;
    });

    return sources.sort((a, b) => b.total - a.total);
  }

  // Helper methods
  private async calculateTimeToHire(startDate: Date, endDate?: Date): Promise<number> {
    const whereClause: any = {
      status: ApplicationStatus.HIRED,
      hiredAt: MoreThan(startDate),
    };

    if (endDate) {
      whereClause.hiredAt = Between(startDate, endDate);
    }

    const hiredApplications = await this.applicationRepository.find({
      where: whereClause,
      relations: ['job'],
    });

    if (hiredApplications.length === 0) return 0;

    const totalDays = hiredApplications.reduce((sum, app) => {
      if (app.hiredAt && app.job && app.job.publishedAt) {
        const days = Math.floor(
          (app.hiredAt.getTime() - app.job.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);

    return Math.round(totalDays / hiredApplications.length);
  }

  private async getTodayInterviewsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.interviewRepository.count({
      where: {
        scheduledDate: Between(today, tomorrow),
        status: InterviewStatus.PROGRAMADA,
      },
    });
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'quarter':
        return 90;
      case 'year':
        return 365;
      default:
        return 30;
    }
  }
}
