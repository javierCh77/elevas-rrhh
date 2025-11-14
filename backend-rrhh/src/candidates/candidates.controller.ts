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
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateMessagingService } from './services/candidate-messaging.service';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly messagingService: CandidateMessagingService,
  ) {}

  @Post()
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Post('send-email')
  async sendEmail(@Body() emailData: SendEmailDto, @Req() req: any) {
    try {
      const userId = req.user?.userId;
      const savedMessage = await this.messagingService.sendEmailToCandidate(
        emailData,
        userId,
      );
      return {
        success: true,
        message: 'Email sent successfully',
        data: savedMessage,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('messages')
  async getMessages(@Query('candidateId') candidateId?: string, @Query('limit') limit?: string) {
    const messages = await this.messagingService.findAll({
      candidateId,
      limit: limit ? parseInt(limit) : undefined,
    });
    return { messages };
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive' | 'blacklisted',
    @Query('skills') skills?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : undefined,
    };

    return this.candidatesService.findAll(options);
  }

  @Get('stats')
  getStats() {
    return this.candidatesService.getStats();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.candidatesService.findAll({
      search: query,
      limit: 20,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.candidatesService.findOne(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.candidatesService.findByEmail(email);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.candidatesService.remove(id);
  }
}