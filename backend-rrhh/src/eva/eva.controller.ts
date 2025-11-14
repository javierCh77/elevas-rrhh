import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { EvaService } from './eva.service';
import { Response } from 'express';

@Controller('eva')
export class EvaController {
  constructor(private readonly evaService: EvaService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; context?: any }) {
    try {
      const { message, context } = body;

      if (!message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      const response = await this.evaService.processChatMessage(message, context);

      return {
        success: true,
        data: {
          response,
          timestamp: new Date(),
          context: context || null
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error processing chat message',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('analyze-cv/:fileName')
  async analyzeCv(
    @Param('fileName') fileName: string,
    @Body() body: {
      customPrompt?: string;
      candidateId?: string;
      applicationId?: string;
      analyzedById?: string;
    }
  ) {
    try {
      const filePath = `uploads/cvs/${fileName}`;
      const analysis = await this.evaService.analyzeCv(
        filePath,
        body.customPrompt,
        body.candidateId,
        body.applicationId,
        body.analyzedById
      );

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      throw new HttpException(
        'Error analyzing CV',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('analyze-cv-preview/:fileName')
  async analyzeCvPreview(
    @Param('fileName') fileName: string,
    @Body() body: {
      customPrompt?: string;
    }
  ) {
    try {
      const filePath = `uploads/cvs/${fileName}`;
      const analysis = await this.evaService.analyzeCvPreview(
        filePath,
        body.customPrompt
      );

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      throw new HttpException(
        'Error analyzing CV preview',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('save-analysis')
  async saveAnalysis(
    @Body() body: {
      fileName: string;
      customPrompt?: string;
      candidateId?: string;
      applicationId?: string;
      analyzedById?: string;
      analysisData: any;
    }
  ) {
    try {
      const savedAnalysis = await this.evaService.saveAnalysisToDatabase(
        body.analysisData,
        body.fileName,
        body.customPrompt,
        body.candidateId,
        body.applicationId,
        body.analyzedById
      );

      return {
        success: true,
        data: savedAnalysis
      };
    } catch (error) {
      throw new HttpException(
        'Error saving analysis',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('candidates-with-cvs')
  async getCandidatesWithCvs() {
    try {
      const candidates = await this.evaService.getCandidatesWithCvs();

      return {
        success: true,
        data: {
          candidates,
          total: candidates.length
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error listing candidates with CVs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('cvs')
  async listCvs() {
    try {
      const cvs = await this.evaService.listAvailableCvs();

      return {
        success: true,
        data: {
          cvs,
          total: cvs.length
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error listing CVs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // @Get('analysis-history')
  // async getAnalysisHistory(@Query('candidateId') candidateId?: string) {
  //   try {
  //     const analyses = await this.evaService.getAnalysisHistory(candidateId);

  //     return {
  //       success: true,
  //       data: {
  //         analyses,
  //         total: analyses.length
  //       }
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       'Error retrieving analysis history',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  @Post('analyze-candidate-summary')
  async analyzeCandidateSummary(
    @Body() body: {
      candidateEmail: string;
      jobTitle: string;
      jobDescription: string;
      resumeUrl: string;
    }
  ) {
    try {
      const { candidateEmail, jobTitle, jobDescription, resumeUrl } = body;

      if (!candidateEmail || !jobTitle || !jobDescription || !resumeUrl) {
        throw new HttpException(
          'Missing required fields: candidateEmail, jobTitle, jobDescription, resumeUrl',
          HttpStatus.BAD_REQUEST
        );
      }

      const summary = await this.evaService.generateCandidateSummary(
        candidateEmail,
        jobTitle,
        jobDescription,
        resumeUrl
      );

      return summary;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generating candidate summary',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('save-chat-report')
  async saveChatReport(
    @Body() body: {
      content: string;
      timestamp: Date;
      attachedCVs?: string[];
      selectedCVs?: { candidateName: string; fileName: string; candidateId: string }[];
    }
  ) {
    try {
      const savedReport = await this.evaService.saveChatReport(body);

      return {
        success: true,
        data: savedReport
      };
    } catch (error) {
      throw new HttpException(
        'Error saving chat report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('analyze-candidate-profile')
  async analyzeCandidateProfile(
    @Body() body: {
      candidateId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      location?: string;
      experience?: string;
      skills?: string[];
      linkedinUrl?: string;
      resumeUrl?: string;
      applications?: any[];
    }
  ) {
    try {
      const analysis = await this.evaService.analyzeCandidateProfile(body);

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error analyzing candidate profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // @Get('download-report/:id')
  // async downloadReport(
  //   @Param('id') id: string,
  //   @Res() res: Response
  // ) {
  //   try {
  //     const report = await this.evaService.getReportById(id);

  //     if (!report) {
  //       throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
  //     }

  //     const candidateName = report.candidate
  //       ? `${report.candidate.firstName}_${report.candidate.lastName}`
  //       : 'Analisis_EVA';

  //     const pdfBuffer = await this.evaService.generatePDFReport({
  //       content: report.rawAnalysis?.content || 'Sin contenido',
  //       timestamp: report.createdAt,
  //       attachedCVs: report.rawAnalysis?.attachedCVs || [],
  //       selectedCVs: report.rawAnalysis?.selectedCVs || []
  //     });

  //     res.set({
  //       'Content-Type': 'application/pdf',
  //       'Content-Disposition': `attachment; filename=Reporte_${candidateName}_${Date.now()}.pdf`,
  //       'Content-Length': pdfBuffer.length,
  //     });

  //     res.send(pdfBuffer);
  //   } catch (error) {
  //     throw new HttpException(
  //       'Error downloading report',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      data: {
        status: 'active',
        timestamp: new Date(),
        features: {
          chat: true,
          cvAnalysis: true,
          candidateSummary: true,
          openaiEnabled: process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
        }
      }
    };
  }

  @Get('connection-status')
  async getConnectionStatus() {
    try {
      const status = await this.evaService.checkOpenAIConnection();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      throw new HttpException(
        'Error checking connection status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('candidate-profile-analysis/:candidateId')
  async getCandidateProfileAnalysis(@Param('candidateId') candidateId: string) {
    try {
      const analysis = await this.evaService.getLatestCandidateProfileAnalysis(candidateId);

      if (!analysis) {
        return {
          success: true,
          data: null
        };
      }

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      throw new HttpException(
        'Error retrieving candidate profile analysis',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}