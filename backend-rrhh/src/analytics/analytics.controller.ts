import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardAnalytics(startDate, endDate);
  }

  @Get('kpis')
  async getKPIs(
    @Query('period') period?: string, // 'week', 'month', 'quarter', 'year'
  ) {
    return this.analyticsService.getKPIs(period);
  }

  @Get('recruitment-funnel')
  async getRecruitmentFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRecruitmentFunnel(startDate, endDate);
  }

  @Get('department-stats')
  async getDepartmentStats() {
    return this.analyticsService.getDepartmentStats();
  }

  @Get('time-series')
  async getTimeSeries(
    @Query('metric') metric: string,
    @Query('period') period: string,
    @Query('months') months: number = 6,
  ) {
    return this.analyticsService.getTimeSeries(metric, period, months);
  }

  @Get('alerts')
  async getAlerts() {
    return this.analyticsService.getAlerts();
  }

  @Get('source-effectiveness')
  async getSourceEffectiveness() {
    return this.analyticsService.getSourceEffectiveness();
  }
}
