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
  Req,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewStatus } from './entities/interview.entity';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  async create(@Body() createInterviewDto: CreateInterviewDto, @Req() req: any) {
    const userId = req.user?.userId;
    return await this.interviewsService.create(createInterviewDto, userId);
  }

  @Get()
  async findAll(
    @Query('status') status?: InterviewStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('applicationId') applicationId?: string,
  ) {
    return await this.interviewsService.findAll({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      applicationId,
    });
  }

  @Get('today')
  async getTodayInterviews() {
    return await this.interviewsService.getTodayInterviews();
  }

  @Get('upcoming')
  async getUpcomingInterviews() {
    return await this.interviewsService.getUpcomingInterviews();
  }

  @Get('by-application/:applicationId')
  async findByApplication(@Param('applicationId') applicationId: string) {
    return await this.interviewsService.findByApplication(applicationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.interviewsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return await this.interviewsService.update(id, updateInterviewDto);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('cancellationReason') cancellationReason?: string,
  ) {
    return await this.interviewsService.cancel(id, cancellationReason);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body('rating') rating?: number,
    @Body('interviewerNotes') interviewerNotes?: string,
  ) {
    return await this.interviewsService.complete(id, rating, interviewerNotes);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.interviewsService.remove(id);
    return { message: 'Interview deleted successfully' };
  }
}
