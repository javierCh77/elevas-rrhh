import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from './entities/job.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    // For now, create without user authentication - we'll add it later
    return this.jobsService.createWithoutUser(createJobDto);
  }

  @Get()
  findAll(
    @Query('status') status?: JobStatus,
    @Query('department') department?: string,
    @Query('isPublic') isPublic?: boolean,
  ) {
    return this.jobsService.findAll({
      status,
      department,
      isPublic: isPublic === true,
    });
  }

  @Get('public')
  findPublicJobs() {
    return this.jobsService.findPublicJobs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.jobsService.publish(id);
  }

  @Patch(':id/pause')
  pause(@Param('id') id: string) {
    return this.jobsService.pause(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.jobsService.activate(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.jobsService.close(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
