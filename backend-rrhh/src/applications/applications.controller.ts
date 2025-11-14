import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ApplicationsService } from './applications.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from './entities/application.entity';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.createWithoutFile(createApplicationDto);
  }

  @Post('public')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `cv-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(new BadRequestException('Only PDF files are allowed'), false);
        } else {
          callback(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async createPublic(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('CV file is required');
      }

      // Convert file path to accessible URL
      const fileUrl = `/uploads/cvs/${file.filename}`;

      const result = await this.applicationsService.createPublicApplication(createApplicationDto, fileUrl);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll(
    @Query('status') status?: ApplicationStatus,
    @Query('jobId') jobId?: string,
  ) {
    return this.applicationsService.findAll({ status, jobId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateWithoutUser(id, updateApplicationDto);
  }

  @Patch(':id/update-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `cv-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(new BadRequestException('Only PDF files are allowed'), false);
        } else {
          callback(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async updateApplicationCv(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('CV file is required');
      }

      const fileUrl = `/uploads/cvs/${file.filename}`;
      return await this.applicationsService.updateCv(id, fileUrl);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }

  // AI Summary Endpoints
  @Post(':id/ai-summary')
  async saveAiSummary(
    @Param('id') applicationId: string,
    @Body() body: { summaryData: any; analyzedById?: string }
  ) {
    const summary = await this.applicationsService.saveAiSummary(
      applicationId,
      body.summaryData,
      body.analyzedById
    );
    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id/ai-summary')
  async getAiSummary(@Param('id') applicationId: string) {
    const summary = await this.applicationsService.getAiSummary(applicationId);
    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id/ai-summary/download-pdf')
  async downloadAiSummaryPdf(
    @Param('id') applicationId: string,
    @Res() res: Response
  ) {
    try {
      // Obtener el resumen guardado
      const summary = await this.applicationsService.getAiSummary(applicationId);

      if (!summary) {
        throw new NotFoundException('No AI summary found for this application');
      }

      // Preparar datos para el PDF
      const pdfData = {
        candidateName: summary.candidateName,
        candidateEmail: summary.candidateEmail,
        jobTitle: summary.jobTitle,
        globalMatch: summary.globalMatch,
        experienceMatch: summary.experienceMatch,
        educationMatch: summary.educationMatch,
        skillsMatch: summary.skillsMatch,
        affinityMatch: summary.affinityMatch,
        experienceAnalysis: summary.experienceAnalysis,
        educationAnalysis: summary.educationAnalysis,
        skillsAnalysis: summary.skillsAnalysis,
        affinityAnalysis: summary.affinityAnalysis,
        synthesis: summary.synthesis,
        recommendation: summary.recommendation,
        analyzedDate: summary.createdAt,
      };

      // Generar nombre de archivo
      const fileName = `analisis-${summary.candidateName?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      const outputPath = join(process.cwd(), 'uploads', 'pdfs', fileName);

      // Asegurar que existe el directorio
      const pdfDir = join(process.cwd(), 'uploads', 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Generar PDF
      await this.pdfGeneratorService.generateSummaryPdf(pdfData, outputPath);

      // Enviar archivo
      res.download(outputPath, fileName, (err) => {
        if (err) {
          throw new BadRequestException('Error sending PDF');
        }
        // Opcional: Eliminar archivo temporal después de enviar
        // fs.unlinkSync(outputPath);
      });
    } catch (error) {
      throw new BadRequestException('Error generating PDF summary');
    }
  }
}
