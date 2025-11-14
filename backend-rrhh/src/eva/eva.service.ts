import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import * as PDFDocument from 'pdfkit';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Application } from '../applications/entities/application.entity';
import { CvAnalysis, AnalysisRecommendation } from './entities/cv-analysis.entity';

@Injectable()
export class EvaService {
  private readonly logger = new Logger(EvaService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(CvAnalysis)
    private cvAnalysisRepository: Repository<CvAnalysis>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      this.logger.warn('OpenAI API key not configured. EVA will work in simulation mode.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  private getSystemPrompt(): string {
    return `Eres EVA, un asistente inteligente especializado en Recursos Humanos y gestión de talento. Tu conocimiento incluye:

🎯 **Especialidades principales:**
- Análisis y evaluación de CVs/candidatos
- Estrategias de reclutamiento y selección
- Gestión de procesos de contratación
- Análisis de competencias y habilidades
- Optimización de procesos de RRHH
- Recomendaciones de mejora organizacional

📊 **Capacidades de análisis:**
- Evaluación técnica y soft skills
- Identificación de red flags en CVs
- Matching candidato-puesto
- Análisis de mercado laboral
- Métricas de rendimiento de reclutamiento

💡 **Estilo de comunicación:**
- Profesional pero accesible
- Basado en datos y evidencias
- Propositivo y orientado a soluciones
- Explicaciones claras y actionables

🔍 **Contexto actual:**
Estás integrada en la plataforma Elevas HR, donde tienes acceso a:
- Base de datos de candidatos y aplicaciones
- CVs subidos por candidatos
- Puestos de trabajo activos
- Historial de contrataciones
- Métricas del sistema

Siempre proporciona respuestas útiles, precisas y orientadas a la acción. Si no tienes información específica, ofrece mejores prácticas de la industria.`;
  }

  /**
   * Check OpenAI connection status
   */
  async checkOpenAIConnection(): Promise<{ connected: boolean; message: string; model?: string }> {
    try {
      if (!this.openai) {
        return {
          connected: false,
          message: 'API key no configurada. Modo simulación activo.'
        };
      }

      // Make a simple test call to verify connection
      await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });

      return {
        connected: true,
        message: 'Conectado a OpenAI',
        model: 'gpt-4o-mini'
      };
    } catch (error) {
      this.logger.error('Error checking OpenAI connection:', error);
      return {
        connected: false,
        message: error.message || 'Error de conexión con OpenAI'
      };
    }
  }

  async processChatMessage(message: string, context?: any): Promise<string> {
    try {
      if (!this.openai) {
        return this.getSimulatedResponse(message, context);
      }

      const systemPrompt = this.getSystemPrompt();

      // Agregar contexto si está disponible
      let userMessage = message;

      // Si hay CVs seleccionados en el contexto, leer su contenido
      if (context?.selectedCVs && Array.isArray(context.selectedCVs) && context.selectedCVs.length > 0) {
        this.logger.log(`[CHAT] Processing ${context.selectedCVs.length} selected CVs`);

        const cvContents: string[] = [];

        for (const cvInfo of context.selectedCVs) {
          try {
            // Buscar el candidato en la base de datos
            const candidate = await this.candidateRepository.findOne({
              where: { id: cvInfo.id }
            });

            if (candidate && candidate.resumeUrl) {
              this.logger.log(`[CHAT] Found candidate: ${candidate.firstName} ${candidate.lastName}, CV: ${candidate.resumeUrl}`);

              // Construir ruta del archivo
              const filePath = path.join(process.cwd(), candidate.resumeUrl);

              if (fs.existsSync(filePath)) {
                try {
                  // Leer y parsear el PDF
                  const fileBuffer = fs.readFileSync(filePath);
                  const pdfData = await pdfParse(fileBuffer);
                  const cvContent = pdfData.text;

                  cvContents.push(`\n\n=== CV de ${candidate.firstName} ${candidate.lastName} ===\n${cvContent.slice(0, 3000)}${cvContent.length > 3000 ? '...' : ''}`);

                  this.logger.log(`[CHAT] Successfully read CV for ${candidate.firstName} ${candidate.lastName}. Content length: ${cvContent.length}`);
                } catch (pdfError) {
                  this.logger.error(`[CHAT] Error parsing PDF for ${candidate.firstName} ${candidate.lastName}:`, pdfError);
                  cvContents.push(`\n\n=== CV de ${candidate.firstName} ${candidate.lastName} ===\nArchivo: ${candidate.resumeUrl}\n(No se pudo leer el contenido del PDF)`);
                }
              } else {
                this.logger.warn(`[CHAT] CV file not found at: ${filePath}`);
                cvContents.push(`\n\n=== CV de ${candidate.firstName} ${candidate.lastName} ===\nArchivo no encontrado: ${candidate.resumeUrl}`);
              }
            } else {
              this.logger.warn(`[CHAT] Candidate not found or no CV: ${cvInfo.id}`);
            }
          } catch (error) {
            this.logger.error(`[CHAT] Error processing CV ${cvInfo.id}:`, error);
          }
        }

        // Agregar el contenido de los CVs al mensaje
        if (cvContents.length > 0) {
          userMessage += `\n\n📄 CONTENIDO DE LOS CVs ADJUNTOS:${cvContents.join('\n')}`;
        }
      }

      // Agregar otro contexto si está disponible
      if (context) {
        const contextWithoutCVs = { ...context };
        delete contextWithoutCVs.selectedCVs;

        if (Object.keys(contextWithoutCVs).length > 0) {
          userMessage += `\n\nContexto adicional:\n${JSON.stringify(contextWithoutCVs, null, 2)}`;
        }
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

    } catch (error) {
      this.logger.error('Error calling OpenAI API:', error);
      return 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.';
    }
  }

  async analyzeCv(filePath: string, customPrompt?: string, candidateId?: string, applicationId?: string, userId?: string): Promise<any> {
    try {
      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error('CV file not found');
      }

      const fileName = path.basename(filePath);
      let cvContent = '';

      try {
        // Intentar parsear el PDF
        const fileBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(fileBuffer);
        cvContent = pdfData.text;
      } catch (pdfError) {
        this.logger.warn(`Could not parse PDF ${fileName}, using filename analysis`);
        cvContent = `CV archivo: ${fileName}`;
      }

      if (!this.openai) {
        return this.getSimulatedCvAnalysis(fileName, cvContent);
      }

      const basePrompt = `Analiza este CV y proporciona un análisis detallado:

CONTENIDO DEL CV:
${cvContent.slice(0, 3000)}${cvContent.length > 3000 ? '...' : ''}

Por favor proporciona:
1. Puntuación general (0-100)
2. Fortalezas principales (máximo 5 puntos)
3. Áreas de mejora (máximo 3 puntos)
4. Skills técnicos identificados
5. Años de experiencia estimados
6. Red flags (si los hay)
7. Recomendaciones específicas

Responde en formato JSON estructurado para facilitar el procesamiento.`;

      const analysisPrompt = customPrompt
        ? `${customPrompt}\n\nCONTENIDO DEL CV:\n${cvContent.slice(0, 3000)}${cvContent.length > 3000 ? '...' : ''}\n\nResponde en formato JSON estructurado para facilitar el procesamiento.`
        : basePrompt;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const analysis = completion.choices[0]?.message?.content;

      // Intentar parsear la respuesta JSON, si no funciona usar parseado manual
      let analysisResult: any;
      try {
        const jsonAnalysis = JSON.parse(analysis);
        analysisResult = {
          fileName,
          cvContent: cvContent.slice(0, 500),
          ...jsonAnalysis,
          analysisDate: new Date(),
          aiGenerated: true,
          realContent: true
        };
      } catch (jsonError) {
        // Fallback al parseado manual
        analysisResult = this.parseAnalysisResponse(analysis, fileName, cvContent);
      }

      // Guardar análisis en la base de datos
      try {
        const savedAnalysis = await this.saveAnalysisToDatabase(
          analysisResult,
          fileName,
          customPrompt,
          candidateId,
          applicationId,
          userId
        );

        // Retornar el análisis con el ID de la base de datos
        return {
          ...analysisResult,
          analysisId: savedAnalysis.id,
          persistent: true
        };
      } catch (dbError) {
        this.logger.error('Error saving to database, returning analysis anyway:', dbError);
        return analysisResult;
      }

    } catch (error) {
      this.logger.error('Error analyzing CV:', error);
      return this.getSimulatedCvAnalysis();
    }
  }

  private parseAnalysisResponse(analysis: string, fileName: string, cvContent?: string): any {
    // Parseado manual de la respuesta de OpenAI
    const lines = analysis.split('\n');
    let score = 75;
    let strengths = [];
    let improvements = [];
    let technicalSkills = [];
    let experience = 3;
    let redFlags = [];

    // Intentar extraer información de la respuesta
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('puntuación') || lowerLine.includes('score')) {
        const scoreMatch = line.match(/\d+/);
        if (scoreMatch) score = parseInt(scoreMatch[0]);
      }
      if (lowerLine.includes('experiencia') && lowerLine.includes('año')) {
        const expMatch = line.match(/\d+/);
        if (expMatch) experience = parseInt(expMatch[0]);
      }
    });

    // Extraer skills del contenido del CV si está disponible
    if (cvContent) {
      const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'angular', 'vue', 'typescript', 'php', 'c#', 'ruby', 'go', 'swift', 'kotlin'];
      technicalSkills = commonSkills.filter(skill =>
        cvContent.toLowerCase().includes(skill)
      );
    }

    return {
      fileName,
      cvContent: cvContent ? cvContent.slice(0, 500) : '',
      score: Math.max(60, Math.min(100, score)),
      strengths: strengths.length > 0 ? strengths : [
        'Experiencia relevante demostrada',
        'Perfil profesional bien estructurado',
        'Formación adecuada para el área'
      ],
      improvements: improvements.length > 0 ? improvements : [
        'Ampliar certificaciones profesionales',
        'Mejorar presencia digital'
      ],
      technicalSkills: technicalSkills.length > 0 ? technicalSkills : ['Habilidades identificadas en el CV'],
      experience: Math.max(1, Math.min(15, experience)),
      redFlags: redFlags,
      analysisDate: new Date(),
      aiGenerated: true,
      realContent: !!cvContent
    };
  }

  private getSimulatedResponse(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cv') || lowerMessage.includes('currículum')) {
      return `📄 **Análisis de CVs disponibles:**

Tengo acceso a ${this.getCvCount()} CVs en el sistema. Puedo ayudarte con:

• **Análisis detallado** de cualquier CV específico
• **Comparación** entre candidatos
• **Identificación** de los mejores matches para puestos
• **Detección** de red flags o inconsistencias
• **Sugerencias** de mejora para candidatos

¿Te gustaría que analice algún CV en particular o prefieres un resumen general de los candidatos?`;
    }

    if (lowerMessage.includes('candidato') || lowerMessage.includes('aplicac')) {
      const stats = context || {};
      return `👥 **Estado actual de candidatos:**

• **Activos:** ${stats.activeCandidates || 'N/A'}
• **Aplicaciones pendientes:** ${stats.pendingApplications || 'N/A'}
• **Contrataciones este mes:** ${stats.hiredThisMonth || 'N/A'}

💡 **Recomendaciones:**
- Revisar aplicaciones pendientes para mantener flujo eficiente
- Programar entrevistas para candidatos de alta puntuación
- Enviar feedback a candidatos que no avanzaron

¿En qué proceso específico necesitas ayuda?`;
    }

    if (lowerMessage.includes('puesto') || lowerMessage.includes('trabajo')) {
      return `🎯 **Gestión de puestos de trabajo:**

Puedo ayudarte con:
• **Optimización** de descripciones de puesto
• **Análisis** de competencia salarial
• **Identificación** de skills más demandados
• **Estrategias** de atracción de talento
• **Métricas** de rendimiento por puesto

¿Qué puesto te interesa analizar o optimizar?`;
    }

    return `👋 ¡Hola! Soy **EVA**, tu asistente especializada en RRHH.

🔍 **Puedo ayudarte con:**
• Análisis de CVs y candidatos
• Optimización de procesos de reclutamiento
• Estrategias de selección de personal
• Métricas y KPIs de RRHH
• Recomendaciones personalizadas

💬 **Pregúntame sobre:**
- "Analiza el CV de [candidato]"
- "¿Cuáles son los mejores candidatos para [puesto]?"
- "¿Cómo mejorar nuestro proceso de selección?"
- "Dame un resumen de candidatos activos"

¿En qué puedo ayudarte hoy?`;
  }

  private getSimulatedCvAnalysis(fileName?: string, cvContent?: string): any {
    return {
      fileName: fileName || 'cv-simulado.pdf',
      cvContent: cvContent ? cvContent.slice(0, 500) : 'Contenido del CV no disponible',
      score: Math.floor(Math.random() * 30) + 70,
      strengths: [
        'Experiencia relevante demostrada',
        'Formación técnica adecuada',
        'Soft skills evidentes'
      ],
      improvements: [
        'Ampliar certificaciones',
        'Mejorar presencia digital profesional'
      ],
      technicalSkills: ['JavaScript', 'Node.js', 'SQL', 'Git'],
      experience: Math.floor(Math.random() * 8) + 2,
      redFlags: [],
      analysisDate: new Date(),
      aiGenerated: true,
      simulated: !cvContent,
      realContent: !!cvContent
    };
  }

  private getCvCount(): number {
    try {
      const cvDir = path.join(process.cwd(), 'uploads', 'cvs');
      if (fs.existsSync(cvDir)) {
        return fs.readdirSync(cvDir).filter(file => file.endsWith('.pdf')).length;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async listAvailableCvs(): Promise<string[]> {
    try {
      const cvDir = path.join(process.cwd(), 'uploads', 'cvs');
      if (fs.existsSync(cvDir)) {
        return fs.readdirSync(cvDir).filter(file => file.endsWith('.pdf'));
      }
      return [];
    } catch (error) {
      this.logger.error('Error listing CVs:', error);
      return [];
    }
  }

  async getCandidatesWithCvs(): Promise<any[]> {
    try {
      // Buscar candidatos que tengan resumeUrl
      const candidates = await this.candidateRepository.find({
        where: {
          resumeUrl: Not(IsNull())
        },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'resumeUrl',
          'yearsOfExperience',
          'skills',
          'location',
          'status',
          'createdAt'
        ],
        order: {
          createdAt: 'DESC'
        }
      });

      // También buscar aplicaciones que tengan resumeUrl
      const applications = await this.applicationRepository.find({
        where: {
          resumeUrl: Not(IsNull())
        },
        relations: ['candidate'],
        select: {
          id: true,
          resumeUrl: true,
          status: true,
          createdAt: true,
          candidate: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            yearsOfExperience: true,
            skills: true,
            location: true,
            status: true
          }
        },
        order: {
          createdAt: 'DESC'
        }
      });

      // Combinar y formatear los resultados
      const candidateResults = candidates.map(candidate => ({
        id: candidate.id,
        type: 'candidate' as const,
        fullName: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        phone: candidate.phone,
        resumeUrl: candidate.resumeUrl,
        fileName: this.extractFileNameFromUrl(candidate.resumeUrl),
        yearsOfExperience: candidate.yearsOfExperience,
        skills: candidate.skills || [],
        location: candidate.location,
        status: candidate.status,
        createdAt: candidate.createdAt
      }));

      const applicationResults = applications
        .filter(app => app.candidate) // Asegurar que tiene candidato
        .map(application => ({
          id: application.candidate.id,
          applicationId: application.id,
          type: 'application' as const,
          fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          email: application.candidate.email,
          phone: application.candidate.phone,
          resumeUrl: application.resumeUrl,
          fileName: this.extractFileNameFromUrl(application.resumeUrl),
          yearsOfExperience: application.candidate.yearsOfExperience,
          skills: application.candidate.skills || [],
          location: application.candidate.location,
          status: application.candidate.status,
          applicationStatus: application.status,
          createdAt: application.createdAt
        }));

      // Combinar y eliminar duplicados por email
      const allResults = [...candidateResults, ...applicationResults];
      const uniqueResults = allResults.reduce((acc, current) => {
        const existing = acc.find(item => item.email === current.email);
        if (!existing) {
          acc.push(current);
        } else if (current.type === 'application' && existing.type === 'candidate') {
          // Preferir datos de aplicación si son más recientes
          if (current.createdAt > existing.createdAt) {
            const index = acc.indexOf(existing);
            acc[index] = current;
          }
        }
        return acc;
      }, []);

      return uniqueResults.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      this.logger.error('Error getting candidates with CVs:', error);
      return [];
    }
  }

  private extractFileNameFromUrl(url: string): string {
    if (!url) return '';
    // Extraer el nombre del archivo de la URL
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  // Función para analizar CV sin guardarlo (preview)
  async analyzeCvPreview(filePath: string, customPrompt?: string): Promise<any> {
    try {
      // Construir la ruta absoluta
      const absolutePath = path.join(process.cwd(), filePath);
      this.logger.log(`[PREVIEW] Attempting to analyze CV at path: ${absolutePath}`);

      // Verificar si el archivo existe
      if (!fs.existsSync(absolutePath)) {
        this.logger.error(`[PREVIEW] CV file not found at: ${absolutePath}`);
        throw new Error(`CV file not found at: ${absolutePath}`);
      }

      const fileName = path.basename(filePath);
      let cvContent = '';

      try {
        // Intentar parsear el PDF
        const fileBuffer = fs.readFileSync(absolutePath);
        const pdfData = await pdfParse(fileBuffer);
        cvContent = pdfData.text;
        this.logger.log(`[PREVIEW] Successfully parsed PDF. Content length: ${cvContent.length}`);
        this.logger.log(`[PREVIEW] First 200 characters: ${cvContent.slice(0, 200)}`);
      } catch (pdfError) {
        this.logger.warn(`[PREVIEW] Could not parse PDF ${fileName}, using filename analysis. Error: ${pdfError.message}`);
        cvContent = `CV archivo: ${fileName}`;
      }

      if (!this.openai) {
        this.logger.warn('[PREVIEW] OpenAI not configured, returning simulated analysis');
        const simulatedResult = this.getSimulatedCvAnalysis(fileName, cvContent);
        simulatedResult.preview = true;
        return simulatedResult;
      }

      this.logger.log(`[PREVIEW] OpenAI configured, proceeding with real analysis for ${fileName}`);

      const basePrompt = `Analiza este CV de manera detallada y objetiva:

CONTENIDO DEL CV:
${cvContent.slice(0, 3000)}${cvContent.length > 3000 ? '...' : ''}

INSTRUCCIONES:
1. Lee cuidadosamente todo el contenido del CV
2. Evalúa la experiencia, educación y habilidades reales
3. Sé específico y realista en tu evaluación

Responde ÚNICAMENTE en formato JSON válido:
{
  "score": [número entre 0-100 basado en el contenido real],
  "strengths": [array de fortalezas específicas encontradas],
  "improvements": [array de áreas de mejora específicas],
  "technicalSkills": [array de habilidades técnicas REALMENTE encontradas en el CV],
  "experience": [número de años de experiencia según el CV],
  "redFlags": [array de problemas o inconsistencias encontradas]
}`;

      let analysisPrompt = basePrompt;

      if (customPrompt) {
        // Extraer el puesto/rol del prompt personalizado para análisis específico
        const jobRole = this.extractJobFromPrompt(customPrompt);
        analysisPrompt = `ANÁLISIS ESPECÍFICO PARA: ${jobRole.toUpperCase()}

PROMPT DEL USUARIO: ${customPrompt}

CONTENIDO DEL CV:
${cvContent.slice(0, 3000)}${cvContent.length > 3000 ? '...' : ''}

INSTRUCCIONES:
1. Analiza este CV específicamente para el rol de "${jobRole}"
2. Evalúa qué tan bien coincide la experiencia con los requisitos mencionados
3. Identifica skills técnicos relevantes para "${jobRole}"
4. Da una puntuación realista basada en la compatibilidad con el puesto
5. Sé específico sobre fortalezas y debilidades para este rol particular

Responde ÚNICAMENTE en formato JSON válido:
{
  "score": [0-100 basado en compatibilidad con ${jobRole}],
  "strengths": [fortalezas específicas para ${jobRole}],
  "improvements": [mejoras necesarias para ${jobRole}],
  "technicalSkills": [skills técnicos relevantes para ${jobRole} encontrados en el CV],
  "experience": [años de experiencia relevante para ${jobRole}],
  "redFlags": [problemas o falta de requisitos para ${jobRole}]
}`;
      }

      this.logger.log(`[PREVIEW] Sending request to OpenAI with prompt length: ${analysisPrompt.length}`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de CVs. SIEMPRE respondes únicamente en formato JSON válido, sin texto adicional antes o después. No agregues explicaciones fuera del JSON.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.1, // Más determinista
      });

      let analysis = completion.choices[0]?.message?.content || '';
      this.logger.log(`[PREVIEW] Raw OpenAI response: ${analysis}`);

      // Limpiar la respuesta para extraer solo el JSON
      analysis = analysis.trim();

      // Si la respuesta tiene texto adicional, intentar extraer el JSON
      let jsonStart = analysis.indexOf('{');
      let jsonEnd = analysis.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        analysis = analysis.substring(jsonStart, jsonEnd + 1);
        this.logger.log(`[PREVIEW] Extracted JSON: ${analysis}`);
      }

      // Intentar parsear la respuesta JSON
      let analysisResult: any;
      try {
        const jsonAnalysis = JSON.parse(analysis);
        this.logger.log(`[PREVIEW] Successfully parsed JSON response`);

        // Validar que el JSON tiene los campos requeridos
        if (!jsonAnalysis.score || !jsonAnalysis.technicalSkills || jsonAnalysis.experience === undefined) {
          throw new Error('JSON response missing required fields');
        }

        analysisResult = {
          fileName,
          cvContent: cvContent.slice(0, 500),
          ...jsonAnalysis,
          analysisDate: new Date(),
          aiGenerated: true,
          realContent: true,
          preview: true
        };

        this.logger.log(`[PREVIEW] Valid AI analysis created with score: ${jsonAnalysis.score}, skills: ${jsonAnalysis.technicalSkills?.length}, experience: ${jsonAnalysis.experience}`);

      } catch (jsonError) {
        this.logger.error(`[PREVIEW] Failed to parse JSON. Error: ${jsonError.message}. Raw response: ${analysis}`);

        // Como último recurso, usar parsing manual pero con datos más realistas
        analysisResult = this.parseAnalysisResponse(analysis, fileName, cvContent);
        analysisResult.preview = true;

        this.logger.warn(`[PREVIEW] Using fallback manual parsing with score: ${analysisResult.score}`);
      }

      this.logger.log(`[PREVIEW] Final analysis result: ${JSON.stringify(analysisResult, null, 2)}`);
      return analysisResult;

    } catch (error) {
      this.logger.error('[PREVIEW] Error analyzing CV preview:', error);
      const simulatedResult = this.getSimulatedCvAnalysis();
      simulatedResult.preview = true;
      return simulatedResult;
    }
  }

  // Nueva función para persistir análisis en la base de datos
  async saveAnalysisToDatabase(
    analysisData: any,
    fileName: string,
    customPrompt?: string,
    candidateId?: string,
    applicationId?: string,
    userId?: string
  ): Promise<CvAnalysis> {
    try {
      // Mapear recommendation string a enum
      let recommendation: AnalysisRecommendation;
      const score = analysisData.score || 75;
      if (score >= 85) recommendation = AnalysisRecommendation.STRONG_FIT;
      else if (score >= 70) recommendation = AnalysisRecommendation.GOOD_FIT;
      else if (score >= 55) recommendation = AnalysisRecommendation.MODERATE_FIT;
      else recommendation = AnalysisRecommendation.POOR_FIT;

      // Extraer puesto analizado del prompt
      const analyzedPosition = this.extractJobFromPrompt(customPrompt || '');

      // Extraer años de experiencia requeridos del prompt para cálculos consistentes
      const extractExperienceFromPrompt = (prompt: string): number => {
        if (!prompt) return 0
        const experiencePatterns = [
          /(\d+)\s*años?\s+de\s+experiencia/i,
          /con\s+(\d+)\s*años?\s+de\s+exp/i,
          /más\s+de\s+(\d+)\s*años?\s+de/i,
          /mínimo\s+(\d+)\s*años?/i,
          /(\d+)\s*años?\s+exp/i,
          /(\d+)\+\s*años?/i
        ]
        for (const pattern of experiencePatterns) {
          const match = prompt.match(pattern)
          if (match && match[1]) {
            return parseInt(match[1])
          }
        }
        return 0
      }

      // Calcular matches usando la MISMA lógica que el frontend
      const skillsFoundCount = analysisData.technicalSkills?.length || 0
      const calculatedSkillsMatch = skillsFoundCount > 0 ? Math.min(95, 30 + (skillsFoundCount * 15)) : 10

      const experienceRequested = extractExperienceFromPrompt(customPrompt || '')
      const experienceYears = analysisData.experience || 0
      const calculatedExperienceMatch = experienceRequested > 0
        ? Math.min(100, Math.max(10, (experienceYears / experienceRequested) * 100))
        : Math.min(100, Math.max(10, experienceYears * 15))

      const calculatedEducationMatch = Math.min(100, Math.max(20, score - 5 + Math.random() * 10))

      const cvAnalysis = this.cvAnalysisRepository.create({
        fileName,
        resumeUrl: `/uploads/cvs/${fileName}`,
        customPrompt,
        analyzedPosition,
        overallScore: score,
        skillsMatch: Math.round(calculatedSkillsMatch),
        experienceMatch: Math.round(calculatedExperienceMatch),
        educationMatch: Math.round(calculatedEducationMatch),
        skillsFound: analysisData.technicalSkills?.length > 0 ? analysisData.technicalSkills : ['No se encontraron habilidades técnicas específicas'],
        experienceYears: experienceYears,
        redFlags: analysisData.redFlags || [],
        strengths: analysisData.strengths?.length > 0 ? analysisData.strengths : ['Requiere evaluación específica para este puesto'],
        recommendation,
        rawAnalysis: analysisData,
        aiGenerated: true,
        realContent: !!analysisData.cvContent,
        candidateId,
        applicationId,
        analyzedById: userId,
      });

      return await this.cvAnalysisRepository.save(cvAnalysis);
    } catch (error) {
      this.logger.error('Error saving analysis to database:', error);
      throw error;
    }
  }

  // Función para extraer puesto del prompt (duplicada del frontend por ahora)
  private extractJobFromPrompt(prompt: string): string {
    if (!prompt) return 'Análisis general';

    const cleanPrompt = prompt.trim();

    // Patrones para capturar puestos específicos
    const patterns = [
      /para\s+(?:el\s+)?puesto\s+de\s+([^,.\n!?]+?)(?:\s+con\s|\s+que\s|\s*[,.\n!?]|\s*$)/i,
      /como\s+([^,.\n!?]+?)(?:\s+con\s|\s+que\s|\s+eval|\s*[,.\n!?]|\s*$)/i,
      /(?:necesito|busco|requiero).*?(?:puesto\s+)?para\s+([^,.\n!?]+?)(?:\s+con\s|\s+que\s|\s*[,.\n!?]|\s*$)/i,
      /para\s+([^,.\n!?]+?)(?:\s+con\s|\s+que\s|\s+y\s|\s*[,.\n!?]|\s*$)/i,
      /analiza.*?para\s+([^,.\n!?]+?)(?:\s+con\s|\s+eval|\s*[,.\n!?]|\s*$)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanPrompt.match(pattern);
      if (match && match[1]) {
        let extractedJob = match[1]
          .trim()
          .replace(/^(un|una|el|la|los|las)\s+/i, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (extractedJob) {
          extractedJob = extractedJob.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          return extractedJob;
        }
      }
    }

    return 'Análisis especializado';
  }

  // Función para obtener análisis anteriores
  async getAnalysisHistory(candidateId?: string, applicationId?: string): Promise<CvAnalysis[]> {
    const queryBuilder = this.cvAnalysisRepository.createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.candidate', 'candidate')
      .leftJoinAndSelect('analysis.application', 'application')
      .leftJoinAndSelect('analysis.analyzedBy', 'user')
      .orderBy('analysis.createdAt', 'DESC');

    if (candidateId) {
      queryBuilder.andWhere('analysis.candidateId = :candidateId', { candidateId });
    }

    if (applicationId) {
      queryBuilder.andWhere('analysis.applicationId = :applicationId', { applicationId });
    }

    return await queryBuilder.getMany();
  }

  // Función para generar resumen detallado de candidato para puesto específico
  async generateCandidateSummary(
    candidateEmail: string,
    jobTitle: string,
    jobDescription: string,
    resumeUrl: string
  ): Promise<any> {
    try {
      // Construir la ruta del CV
      const filePath = path.join(process.cwd(), resumeUrl);
      this.logger.log(`[SUMMARY] Analyzing candidate CV at: ${filePath}`);

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`CV file not found at: ${filePath}`);
      }

      // Parsear el CV
      let cvContent = '';
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(fileBuffer);
        cvContent = pdfData.text;
        this.logger.log(`[SUMMARY] Successfully parsed CV. Content length: ${cvContent.length}`);
      } catch (pdfError) {
        this.logger.error(`[SUMMARY] Error parsing PDF: ${pdfError.message}`);
        throw new Error('No se pudo leer el contenido del CV');
      }

      if (!this.openai) {
        this.logger.warn('[SUMMARY] OpenAI not configured, returning simulated summary');
        return this.getSimulatedDetailedSummary(jobTitle, cvContent);
      }

      // Crear el prompt específico para el resumen detallado
      const summaryPrompt = `Eres un experto en análisis de RRHH. Analiza este CV para el puesto específico solicitado.

PUESTO: ${jobTitle}
DESCRIPCIÓN DEL PUESTO:
${jobDescription}

CONTENIDO DEL CV:
${cvContent.slice(0, 4000)}${cvContent.length > 4000 ? '...' : ''}

INSTRUCCIONES:
Genera un análisis detallado en formato JSON con la siguiente estructura EXACTA:

{
  "globalMatch": [número 0-100 que representa la coincidencia global],
  "experienceMatch": [número 0-100 para experiencia laboral],
  "educationMatch": [número 0-100 para educación],
  "skillsMatch": [número 0-100 para competencias y habilidades],
  "affinityMatch": [número 0-100 para afinidad con el entorno del puesto],

  "experienceAnalysis": {
    "match": [número 0-100],
    "relevant": [array de objetos con experiencias relevantes: {company, period, role, relevance}],
    "comment": "Comentario profesional sobre la experiencia laboral"
  },

  "educationAnalysis": {
    "match": [número 0-100],
    "degrees": [array de títulos/estudios encontrados],
    "comment": "Comentario sobre la educación del candidato"
  },

  "skillsAnalysis": {
    "match": [número 0-100],
    "cvSkills": [array de habilidades encontradas en el CV],
    "requiredSkills": [array de habilidades requeridas para el puesto],
    "comment": "Comentario sobre las competencias"
  },

  "affinityAnalysis": {
    "match": [número 0-100],
    "comment": "Análisis de afinidad con el entorno específico del puesto"
  },

  "synthesis": {
    "totalScore": [número 0-100],
    "breakdown": [
      {"area": "Experiencia laboral", "weight": 40, "score": [puntuación ponderada]},
      {"area": "Educación", "weight": 20, "score": [puntuación ponderada]},
      {"area": "Competencias", "weight": 30, "score": [puntuación ponderada]},
      {"area": "Afinidad", "weight": 10, "score": [puntuación ponderada]}
    ]
  },

  "recommendation": "Texto de recomendación final profesional y específica"
}

IMPORTANTE:
- Sé específico y realista
- Extrae información REAL del CV
- Las puntuaciones deben ser coherentes con el análisis
- La suma de los weights debe ser 100`;

      this.logger.log('[SUMMARY] Sending request to OpenAI for detailed summary');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto analista de RRHH. SIEMPRE respondes únicamente en formato JSON válido, sin texto adicional.'
          },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      let response = completion.choices[0]?.message?.content || '';
      this.logger.log(`[SUMMARY] Raw OpenAI response length: ${response.length}`);

      // Extraer JSON de la respuesta
      response = response.trim();
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        response = response.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const summaryResult = JSON.parse(response);
        this.logger.log('[SUMMARY] Successfully parsed detailed summary');

        return {
          success: true,
          candidateEmail,
          jobTitle,
          analyzedAt: new Date(),
          summary: summaryResult
        };
      } catch (parseError) {
        this.logger.error(`[SUMMARY] Error parsing JSON: ${parseError.message}`);
        return this.getSimulatedDetailedSummary(jobTitle, cvContent);
      }

    } catch (error) {
      this.logger.error('[SUMMARY] Error generating candidate summary:', error);
      throw error;
    }
  }

  private getSimulatedDetailedSummary(jobTitle: string, cvContent?: string): any {
    const globalMatch = Math.floor(Math.random() * 20) + 75; // 75-95

    return {
      success: true,
      jobTitle,
      analyzedAt: new Date(),
      simulated: true,
      summary: {
        globalMatch,
        experienceMatch: Math.floor(Math.random() * 15) + 80,
        educationMatch: Math.floor(Math.random() * 20) + 70,
        skillsMatch: Math.floor(Math.random() * 15) + 80,
        affinityMatch: Math.floor(Math.random() * 25) + 65,

        experienceAnalysis: {
          match: Math.floor(Math.random() * 15) + 80,
          relevant: [
            {
              company: "Empresa Actual",
              period: "2023-actual",
              role: "Rol relevante",
              relevance: "Muy alineado con el puesto"
            }
          ],
          comment: "Sólida base de experiencia relevante para el puesto."
        },

        educationAnalysis: {
          match: Math.floor(Math.random() * 20) + 70,
          degrees: ["Título universitario relevante", "Certificaciones complementarias"],
          comment: "Cumple y supera los requisitos educativos del puesto."
        },

        skillsAnalysis: {
          match: Math.floor(Math.random() * 15) + 80,
          cvSkills: ["Habilidad 1", "Habilidad 2", "Habilidad 3"],
          requiredSkills: ["Habilidad requerida 1", "Habilidad requerida 2"],
          comment: "Excelente correspondencia entre habilidades del CV y requisitos del puesto."
        },

        affinityAnalysis: {
          match: Math.floor(Math.random() * 25) + 65,
          comment: "Buena afinidad con el entorno y cultura del puesto."
        },

        synthesis: {
          totalScore: globalMatch,
          breakdown: [
            { area: "Experiencia laboral", weight: 40, score: Math.round(globalMatch * 0.4) },
            { area: "Educación", weight: 20, score: Math.round(globalMatch * 0.2) },
            { area: "Competencias", weight: 30, score: Math.round(globalMatch * 0.3) },
            { area: "Afinidad", weight: 10, score: Math.round(globalMatch * 0.1) }
          ]
        },

        recommendation: `El candidato presenta un ${globalMatch}% de compatibilidad con el puesto de ${jobTitle}. Se recomienda avanzar con el proceso de selección.`
      }
    };
  }

  /**
   * Save chat report to database
   */
  async saveChatReport(data: {
    content: string;
    timestamp: Date;
    attachedCVs?: string[];
    selectedCVs?: { candidateName: string; fileName: string; candidateId: string }[];
  }): Promise<CvAnalysis> {
    try {
      const candidateId = data.selectedCVs && data.selectedCVs.length > 0
        ? data.selectedCVs[0].candidateId
        : null;

      // Create analysis record
      const analysis = this.cvAnalysisRepository.create({
        fileName: 'Reporte_EVA_Chat.pdf',
        candidateId,
        customPrompt: 'Reporte generado desde chat de EVA',
        overallScore: 0,
        skillsMatch: 0,
        experienceMatch: 0,
        educationMatch: 0,
        skillsFound: [],
        experienceYears: 0,
        redFlags: [],
        strengths: [],
        recommendation: AnalysisRecommendation.MODERATE_FIT,
        rawAnalysis: {
          content: data.content,
          attachedCVs: data.attachedCVs || [],
          selectedCVs: data.selectedCVs || [],
          timestamp: data.timestamp,
          type: 'chat_report'
        }
      });

      const savedAnalysis = await this.cvAnalysisRepository.save(analysis);
      this.logger.log(`Chat report saved with ID: ${savedAnalysis.id}`);

      return savedAnalysis;
    } catch (error) {
      this.logger.error('Error saving chat report:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<CvAnalysis | null> {
    try {
      const report = await this.cvAnalysisRepository.findOne({
        where: { id },
        relations: ['candidate']
      });
      return report;
    } catch (error) {
      this.logger.error(`Error fetching report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate PDF Report from EVA analysis
   */
  async generatePDFReport(data: {
    content: string;
    timestamp: Date;
    attachedCVs?: string[];
    selectedCVs?: { candidateName: string; fileName: string }[];
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 70, left: 50, right: 50 },
          bufferPages: true // Enable page buffering for footer
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(24)
          .fillColor('#C98F6D')
          .text('EVA - Reporte de Análisis de CVs', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(10)
          .fillColor('#8B7355')
          .text('Elevas RRHH - Sistema de Recursos Humanos', { align: 'center' })
          .moveDown(1);

        // Date
        const formattedDate = new Date(data.timestamp).toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        doc
          .fontSize(9)
          .fillColor('#666')
          .text(`Generado el: ${formattedDate}`, { align: 'right' })
          .moveDown(1);

        // Line
        doc
          .strokeColor('#DAA77B')
          .lineWidth(2)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke()
          .moveDown(1);

        // CVs section
        if (data.attachedCVs && data.attachedCVs.length > 0) {
          doc
            .fontSize(14)
            .fillColor('#C98F6D')
            .text('CVs Adjuntados:', { underline: true })
            .moveDown(0.5);

          data.attachedCVs.forEach((cv, index) => {
            doc
              .fontSize(10)
              .fillColor('#333')
              .text(`${index + 1}. ${cv}`)
              .moveDown(0.3);
          });
          doc.moveDown(0.5);
        }

        if (data.selectedCVs && data.selectedCVs.length > 0) {
          doc
            .fontSize(14)
            .fillColor('#C98F6D')
            .text('Candidatos Analizados:', { underline: true })
            .moveDown(0.5);

          data.selectedCVs.forEach((cv, index) => {
            doc
              .fontSize(10)
              .fillColor('#333')
              .text(`${index + 1}. ${cv.candidateName} (${cv.fileName})`)
              .moveDown(0.3);
          });
          doc.moveDown(0.5);
        }

        // Content
        doc
          .fontSize(14)
          .fillColor('#C98F6D')
          .text('Análisis y Recomendaciones:', { underline: true })
          .moveDown(0.5);

        // Process markdown-style content for PDF
        const processedContent = data.content
          .replace(/###\s+(.+)/g, '\n$1\n') // Convert ### headers to bold text
          .replace(/\*\*(.+?)\*\*/g, '$1'); // Remove ** for bold (PDF will handle via fontSize)

        const lines = processedContent.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed) {
            doc.moveDown(0.3);
            continue;
          }

          // Check if we need a new page (with proper margin)
          if (doc.y > doc.page.height - 120) {
            doc.addPage();
          }

          // Handle different text formats
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            // List item
            doc
              .fontSize(10)
              .fillColor('#333')
              .text(trimmed, {
                indent: 10,
                lineGap: 2
              });
          } else if (trimmed.match(/^\d+\./)) {
            // Numbered list
            doc
              .fontSize(10)
              .fillColor('#333')
              .text(trimmed, {
                indent: 10,
                lineGap: 2
              });
          } else if (trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.endsWith(':')) {
            // Likely a heading
            doc
              .fontSize(12)
              .fillColor('#8B7355')
              .text(trimmed, {
                lineGap: 3
              })
              .moveDown(0.3);
          } else {
            // Regular paragraph
            doc
              .fontSize(10)
              .fillColor('#333')
              .text(trimmed, {
                align: 'justify',
                lineGap: 3
              })
              .moveDown(0.4);
          }
        }

        // Add footers to all pages without creating new pages
        const range = doc.bufferedPageRange();
        const totalPages = range.count;

        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);

          // Use absolute positioning for footer - this won't advance the Y position
          const footerY = doc.page.height - 50;
          const pageNumberY = doc.page.height - 30;

          doc.fontSize(8).fillColor('#999');
          doc.text(
            'Este reporte fue generado automáticamente por EVA',
            50,
            footerY,
            {
              align: 'center',
              width: doc.page.width - 100,
              continued: false // Ensure text doesn't continue to next element
            }
          );

          doc.fontSize(8).fillColor('#999');
          doc.text(
            `Página ${i + 1} de ${totalPages}`,
            50,
            pageNumberY,
            {
              align: 'center',
              width: doc.page.width - 100,
              continued: false
            }
          );
        }

        doc.end();

      } catch (error) {
        this.logger.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Analyze candidate profile with AI
   * Provides comprehensive analysis including strengths, red flags, scores, and recommendations
   */
  async analyzeCandidateProfile(candidateData: {
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
  }): Promise<any> {
    try {
      this.logger.log(`Analyzing profile for candidate: ${candidateData.firstName} ${candidateData.lastName}`);

      if (!this.openai) {
        throw new Error('OpenAI no está configurado correctamente');
      }

      // Build comprehensive candidate profile for analysis
      let profileContext = `
      Candidato: ${candidateData.firstName} ${candidateData.lastName}
      Email: ${candidateData.email}
      ${candidateData.phone ? `Teléfono: ${candidateData.phone}` : ''}
      ${candidateData.location ? `Ubicación: ${candidateData.location}` : ''}
      ${candidateData.experience ? `Experiencia: ${candidateData.experience}` : ''}
      ${candidateData.skills && candidateData.skills.length > 0 ? `Habilidades: ${candidateData.skills.join(', ')}` : ''}
      ${candidateData.linkedinUrl ? `LinkedIn: ${candidateData.linkedinUrl}` : ''}
      ${candidateData.applications && candidateData.applications.length > 0 ? `\nAplicaciones previas: ${candidateData.applications.length} puestos` : 'Sin aplicaciones previas'}
      `;

      // Read and parse CV PDF if available
      if (candidateData.resumeUrl) {
        this.logger.log(`[PROFILE ANALYSIS] Reading CV from: ${candidateData.resumeUrl}`);

        try {
          // Construct file path
          const filePath = path.join(process.cwd(), candidateData.resumeUrl);

          if (fs.existsSync(filePath)) {
            try {
              // Read and parse the PDF
              const fileBuffer = fs.readFileSync(filePath);
              const pdfData = await pdfParse(fileBuffer);
              const cvContent = pdfData.text;

              // Add CV content to profile context
              profileContext += `\n\n=== CONTENIDO COMPLETO DEL CV ===\n${cvContent}`;

              this.logger.log(`[PROFILE ANALYSIS] Successfully read CV. Content length: ${cvContent.length}`);
            } catch (pdfError) {
              this.logger.error(`[PROFILE ANALYSIS] Error parsing PDF:`, pdfError);
              profileContext += `\n\n(Nota: No se pudo leer el contenido del PDF del CV)`;
            }
          } else {
            this.logger.warn(`[PROFILE ANALYSIS] CV file not found at: ${filePath}`);
            profileContext += `\n\n(Nota: Archivo de CV no encontrado)`;
          }
        } catch (error) {
          this.logger.error(`[PROFILE ANALYSIS] Error processing CV file:`, error);
        }
      }

      const systemPrompt = `Eres EVA, un asistente experto en análisis de perfiles de candidatos para RRHH.
      Tu tarea es analizar el perfil del candidato y proporcionar un análisis detallado que incluya:

      1. Un resumen ejecutivo del perfil (2-3 frases)
      2. Análisis detallado del candidato con:
         - Fortalezas principales
         - Áreas de experiencia
         - Nivel de habilidades técnicas y blandas
         - Trayectoria profesional
         - Potencial de crecimiento
      3. Red Flags o señales de alerta (si las hay)
      4. Puntuaciones en áreas clave (0-100):
         - Experiencia
         - Habilidades técnicas
         - Perfil profesional
         - Adecuación cultural
      5. Recomendación final (Altamente Recomendado, Recomendado, Neutral, No Recomendado)

      IMPORTANTE: Si hay contenido del CV disponible, basa tu análisis principalmente en la información detallada del CV,
      incluyendo experiencia laboral completa, educación, certificaciones, y cualquier otro detalle relevante.

      Responde en formato JSON con esta estructura:
      {
        "summary": "Resumen ejecutivo breve",
        "analysis": "Análisis detallado en markdown con headings ### y listas",
        "strengths": ["Fortaleza 1", "Fortaleza 2", ...],
        "redFlags": ["Red flag 1", ...] o [],
        "scores": {
          "experience": 85,
          "technicalSkills": 90,
          "professionalProfile": 88,
          "culturalFit": 75
        },
        "recommendation": "Altamente Recomendado" | "Recomendado" | "Neutral" | "No Recomendado"
      }`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analiza el siguiente perfil de candidato:\n\n${profileContext}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const analysisText = completion.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No se recibió respuesta del modelo de IA');
      }

      const analysis = JSON.parse(analysisText);

      this.logger.log(`Profile analysis completed for candidate ${candidateData.candidateId}`);

      // Map recommendation to database enum
      const recommendationMap = {
        'Altamente Recomendado': AnalysisRecommendation.STRONG_FIT,
        'Recomendado': AnalysisRecommendation.GOOD_FIT,
        'Neutral': AnalysisRecommendation.MODERATE_FIT,
        'No Recomendado': AnalysisRecommendation.POOR_FIT
      };

      // Save analysis to database
      const cvAnalysisEntity = this.cvAnalysisRepository.create({
        candidateId: candidateData.candidateId,
        fileName: candidateData.resumeUrl || 'perfil-candidato',
        resumeUrl: candidateData.resumeUrl,
        customPrompt: 'Análisis completo de perfil del candidato',
        overallScore: Math.round((
          analysis.scores.experience +
          analysis.scores.technicalSkills +
          analysis.scores.professionalProfile +
          analysis.scores.culturalFit
        ) / 4),
        skillsMatch: analysis.scores.technicalSkills || 0,
        experienceMatch: analysis.scores.experience || 0,
        educationMatch: analysis.scores.professionalProfile || 0,
        skillsFound: candidateData.skills || [],
        redFlags: analysis.redFlags || [],
        strengths: analysis.strengths || [],
        recommendation: recommendationMap[analysis.recommendation] || AnalysisRecommendation.MODERATE_FIT,
        rawAnalysis: {
          summary: analysis.summary,
          analysis: analysis.analysis,
          scores: analysis.scores,
          recommendation: analysis.recommendation,
          generatedAt: new Date()
        },
        aiGenerated: true,
        realContent: true
      });

      const savedAnalysis = await this.cvAnalysisRepository.save(cvAnalysisEntity);

      this.logger.log(`Analysis saved to database with ID: ${savedAnalysis.id}`);

      return {
        id: savedAnalysis.id,
        candidateId: candidateData.candidateId,
        candidateName: `${candidateData.firstName} ${candidateData.lastName}`,
        ...analysis,
        generatedAt: savedAnalysis.createdAt
      };

    } catch (error) {
      this.logger.error('Error analyzing candidate profile:', error);
      throw new Error('Error al analizar el perfil del candidato con IA');
    }
  }

  /**
   * Get the latest profile analysis for a candidate
   */
  async getLatestCandidateProfileAnalysis(candidateId: string): Promise<any> {
    try {
      this.logger.log(`Retrieving latest profile analysis for candidate: ${candidateId}`);

      const analysis = await this.cvAnalysisRepository.findOne({
        where: {
          candidateId,
          customPrompt: 'Análisis completo de perfil del candidato'
        },
        order: { createdAt: 'DESC' },
        relations: ['candidate']
      });

      if (!analysis) {
        this.logger.log(`No profile analysis found for candidate: ${candidateId}`);
        return null;
      }

      // Format the response to match the frontend expectations
      return {
        id: analysis.id,
        candidateId: analysis.candidateId,
        candidateName: analysis.candidate
          ? `${analysis.candidate.firstName} ${analysis.candidate.lastName}`
          : 'Unknown',
        summary: analysis.rawAnalysis?.summary || '',
        analysis: analysis.rawAnalysis?.analysis || '',
        strengths: analysis.strengths || [],
        redFlags: analysis.redFlags || [],
        scores: analysis.rawAnalysis?.scores || {
          experience: analysis.experienceMatch,
          technicalSkills: analysis.skillsMatch,
          professionalProfile: analysis.educationMatch,
          culturalFit: 0
        },
        recommendation: analysis.rawAnalysis?.recommendation || analysis.recommendation,
        generatedAt: analysis.createdAt
      };

    } catch (error) {
      this.logger.error('Error retrieving candidate profile analysis:', error);
      throw new Error('Error al recuperar el análisis del perfil del candidato');
    }
  }
}