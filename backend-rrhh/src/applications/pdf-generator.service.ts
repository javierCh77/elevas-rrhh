import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

interface PdfSummaryData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  globalMatch: number;
  experienceMatch: number;
  educationMatch: number;
  skillsMatch: number;
  affinityMatch: number;
  experienceAnalysis?: {
    match: number;
    relevant: Array<{
      company: string;
      period: string;
      role: string;
      relevance: string;
    }>;
    comment: string;
  };
  educationAnalysis?: {
    match: number;
    degrees: string[];
    comment: string;
  };
  skillsAnalysis?: {
    match: number;
    cvSkills: string[];
    requiredSkills: string[];
    comment: string;
  };
  affinityAnalysis?: {
    match: number;
    comment: string;
  };
  synthesis?: {
    totalScore: number;
    breakdown: Array<{
      area: string;
      weight: number;
      score: number;
    }>;
  };
  recommendation: string;
  analyzedDate?: Date;
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  // Paleta de colores corporativa Elevas - Institucional y sobria
  private readonly colors = {
    primary: '#E67E22', // Coral/Dorado Elevas (color institucional)
    primaryDark: '#C25B0C', // Coral oscuro para texto en cajas
    primarySoft: '#F4B183', // Coral suave para bordes sutiles
    secondary: '#1E293B', // Azul-gris institucional
    accent: '#F8FAFC', // Fondo neutro gris muy claro
    accentCoral: '#FFF4E6', // Pastel coral suave para fondos
    accentBlue: '#EFF6FF', // Pastel azul suave para fondos
    titleDark: '#1E293B', // Azul-gris oscuro para títulos (NO negro)
    titleMedium: '#334155', // Gris oscuro neutro para subtítulos
    text: '#334155', // Gris oscuro neutro para texto principal
    textLight: '#64748B', // Gris medio para texto secundario
    metrics: {
      global: '#E67E22', // Coral para coincidencia global
      experience: '#1E293B', // Azul-gris para experiencia
      education: '#E67E22', // Coral para educación
      skills: '#1E293B', // Azul-gris para habilidades
    },
    background: '#FFFFFF', // Blanco puro
    cardBackground: '#F8FAFC', // Gris muy claro para tarjetas
    border: '#E2E8F0', // Gris claro para bordes (1px)
    progressBg: '#F1F5F9', // Fondo para barras de progreso
    footerBorder: '#E5E7EB', // Línea divisoria footer
  };

  async generateSummaryPdf(summaryData: PdfSummaryData, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Análisis IA - ${summaryData.candidateName}`,
            Author: 'Elevas HR - Sistema de Gestión de RRHH',
            Subject: `Resumen de análisis para ${summaryData.jobTitle}`,
          }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header con logo
        this.addHeader(doc);

        // Título principal
        this.addTitle(doc, summaryData);

        // Resumen general con métricas
        this.addGeneralSummary(doc, summaryData);

        // Análisis detallado
        let yPosition = doc.y + 20;

        if (summaryData.experienceAnalysis) {
          yPosition = this.addExperienceSection(doc, summaryData.experienceAnalysis, yPosition);
        }

        if (summaryData.educationAnalysis) {
          yPosition = this.addEducationSection(doc, summaryData.educationAnalysis, yPosition);
        }

        if (summaryData.skillsAnalysis) {
          yPosition = this.addSkillsSection(doc, summaryData.skillsAnalysis, yPosition);
        }

        if (summaryData.affinityAnalysis) {
          yPosition = this.addAffinitySection(doc, summaryData.affinityAnalysis, yPosition);
        }

        // Recomendación final
        this.addRecommendation(doc, summaryData);

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`PDF generated successfully: ${outputPath}`);
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          this.logger.error('Error generating PDF:', error);
          reject(error);
        });
      } catch (error) {
        this.logger.error('Error creating PDF:', error);
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument) {
    const logoPath = path.join(process.cwd(), 'public', 'logoelevas.png');
    const topOffset = 15; // Bajamos todo 15px adicionales

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40 + topOffset, { width: 90 }); // Bajado a Y: 55
    } else {
      doc.fontSize(18)
         .fillColor(this.colors.primary)
         .font('Helvetica-Bold')
         .text('ELEVAS', 50, 45 + topOffset);
    }

    // Línea decorativa
    doc.moveTo(50, 85 + topOffset)
       .lineTo(545, 85 + topOffset)
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    doc.moveDown(2); // Espacio antes del título
  }

  private addTitle(doc: PDFKit.PDFDocument, data: PdfSummaryData) {
    // Título principal - h1 (20px bold) - Reducido para compactar
    doc.fontSize(20)
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('Informe de Análisis Inteligente', { align: 'center' });

    doc.moveDown(0.3);

    // Subtítulo puesto - (14px semibold) - Reducido
    doc.fontSize(14)
       .fillColor(this.colors.titleMedium)
       .font('Helvetica-Bold')
       .text(data.jobTitle, { align: 'center' });

    doc.moveDown(0.6);

    // Info del candidato - (12px regular) - Reducido
    doc.fontSize(12)
       .fillColor(this.colors.text)
       .font('Helvetica-Bold')
       .text(data.candidateName, { align: 'center' });

    doc.moveDown(0.15);

    // Email - (11px regular) - Reducido
    doc.fontSize(11)
       .fillColor(this.colors.textLight)
       .font('Helvetica')
       .text(data.candidateEmail, { align: 'center' });

    doc.moveDown(1);
  }

  private addGeneralSummary(doc: PDFKit.PDFDocument, data: PdfSummaryData) {
    const startY = doc.y;
    const boxPadding = 16; // Reducido de 20 a 16
    const contentWidth = 495;

    // Caja con fondo neutro gris claro SIN borde (minimalista)
    doc.rect(50, startY, contentWidth, 170) // Reducido de 200 a 170
       .fill(this.colors.accent);

    // Título de la sección - h2 (14px semibold) - REDUCIDO
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('RESUMEN GENERAL', 50 + boxPadding, startY + boxPadding);

    // Línea decorativa bajo el título (más corta)
    const lineY = startY + boxPadding + 18; // Reducido de 24 a 18
    doc.moveTo(50 + boxPadding, lineY)
       .lineTo(50 + boxPadding + 90, lineY) // Reducido de 110 a 90
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    // Métricas con barras de progreso minimalistas
    const metrics = [
      { label: 'Coincidencia Global', value: data.globalMatch, color: this.colors.metrics.global, bgColor: this.colors.accentCoral },
      { label: 'Experiencia Laboral', value: data.experienceMatch, color: this.colors.metrics.experience, bgColor: this.colors.accentBlue },
      { label: 'Educación', value: data.educationMatch, color: this.colors.metrics.education, bgColor: this.colors.accentCoral },
      { label: 'Competencias', value: data.skillsMatch, color: this.colors.metrics.skills, bgColor: this.colors.accentBlue },
    ];

    let metricY = lineY + 14; // Reducido de 20 a 14

    metrics.forEach((metric) => {
      // Label de la métrica (texto más pequeño)
      doc.fontSize(12) // Reducido de 13 a 12
         .fillColor(this.colors.text)
         .font('Helvetica')
         .text(metric.label, 50 + boxPadding, metricY, { width: 350, continued: false, lineGap: 5 });

      // Porcentaje en caja pastel suave
      const badgeWidth = 50; // Reducido de 55 a 50
      const badgeHeight = 20; // Reducido de 22 a 20
      const badgeX = 50 + contentWidth - boxPadding - badgeWidth;

      doc.roundedRect(badgeX, metricY - 2, badgeWidth, badgeHeight, 4)
         .fillAndStroke(metric.bgColor, this.colors.border);

      doc.fontSize(11) // Reducido de 12 a 11
         .fillColor(metric.color === this.colors.primary ? this.colors.primaryDark : this.colors.secondary)
         .font('Helvetica-Bold')
         .text(`${metric.value}%`, badgeX, metricY + 1, { width: badgeWidth, align: 'center' });

      // Barra de progreso minimalista (alineada dentro del contenedor)
      const barY = metricY + 22; // Reducido de 26 a 22
      const barWidth = contentWidth - (boxPadding * 2);
      const barHeight = 4; // Reducido de 5 a 4
      const fillWidth = (barWidth * metric.value) / 100;

      // Fondo de la barra
      doc.rect(50 + boxPadding, barY, barWidth, barHeight)
         .fill(this.colors.progressBg);

      // Relleno de la barra con color de métrica
      doc.rect(50 + boxPadding, barY, fillWidth, barHeight)
         .fill(metric.color);

      metricY += 34; // Reducido de 40 a 34
    });

    // Actualizar posición Y después del bloque
    doc.y = startY + 170 + 24; // Margen inferior reducido de 32 a 24
  }

  private addExperienceSection(doc: PDFKit.PDFDocument, data: any, yPos: number): number {
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    const sectionPadding = 20; // Reducido de 32 a 20

    // Título de sección - h2 (14px semibold) - REDUCIDO
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('EXPERIENCIA LABORAL', 50, yPos, { width: 380 });

    // Badge de coincidencia con fondo pastel azul (más pequeño)
    const badgeWidth = 50; // Reducido de 55 a 50
    const badgeHeight = 20; // Reducido de 22 a 20
    const badgeX = 545 - badgeWidth;
    doc.roundedRect(badgeX, yPos - 2, badgeWidth, badgeHeight, 4)
       .fillAndStroke(this.colors.accentBlue, this.colors.border);

    doc.fontSize(11) // Reducido de 12 a 11
       .fillColor(this.colors.secondary)
       .font('Helvetica-Bold')
       .text(`${data.match}%`, badgeX, yPos + 1, { width: badgeWidth, align: 'center' });

    // Línea decorativa sutil (más corta)
    yPos += 18; // Reducido de 22 a 18
    doc.moveTo(50, yPos)
       .lineTo(50 + 110, yPos) // Reducido de 130 a 110
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    yPos += 10; // Reducido de 14 a 10

    // Comentario (texto más pequeño)
    doc.fontSize(12) // Reducido de 13 a 12
       .fillColor(this.colors.text)
       .font('Helvetica')
       .text(data.comment, 50, yPos, { width: 495, align: 'justify', lineGap: 4 }); // lineGap reducido de 6 a 4

    yPos = doc.y + 12; // Reducido de 18 a 12

    // Experiencias relevantes con fondo gris claro (COMPACTAS)
    if (data.relevant && data.relevant.length > 0) {
      data.relevant.forEach((exp: any) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const cardPadding = 10; // Reducido de 16 a 10
        const cardHeight = 38; // Reducido de 52 a 38

        doc.roundedRect(50, yPos, 495, cardHeight, 4)
           .fillAndStroke(this.colors.cardBackground, this.colors.border);

        // Empresa y período en la misma línea
        doc.fontSize(11) // Reducido de 13 a 11
           .fillColor(this.colors.titleMedium)
           .font('Helvetica-Bold')
           .text(`${exp.company}`, 50 + cardPadding, yPos + cardPadding, { width: 200, continued: true });

        doc.fontSize(9) // Reducido de 11 a 9
           .fillColor(this.colors.textLight)
           .font('Helvetica')
           .text(` (${exp.period})`, { continued: false });

        // Rol debajo
        doc.fontSize(10) // Reducido de 12 a 10
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text(exp.role, 50 + cardPadding, yPos + cardPadding + 16);

        yPos += cardHeight + 6; // Reducido espacio entre tarjetas de 10 a 6
      });
    }

    return yPos + sectionPadding;
  }

  private addEducationSection(doc: PDFKit.PDFDocument, data: any, yPos: number): number {
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    const sectionPadding = 20; // Reducido de 32 a 20

    // Título de sección - h2 (14px semibold) - REDUCIDO
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('EDUCACIÓN', 50, yPos, { width: 380 });

    // Badge de coincidencia con fondo pastel coral (más pequeño)
    const badgeWidth = 50; // Reducido de 55 a 50
    const badgeHeight = 20; // Reducido de 22 a 20
    const badgeX = 545 - badgeWidth;
    doc.roundedRect(badgeX, yPos - 2, badgeWidth, badgeHeight, 4)
       .fillAndStroke(this.colors.accentCoral, this.colors.border);

    doc.fontSize(11) // Reducido de 12 a 11
       .fillColor(this.colors.primaryDark)
       .font('Helvetica-Bold')
       .text(`${data.match}%`, badgeX, yPos + 1, { width: badgeWidth, align: 'center' });

    // Línea decorativa sutil (más corta)
    yPos += 18; // Reducido de 22 a 18
    doc.moveTo(50, yPos)
       .lineTo(50 + 90, yPos) // Reducido de 110 a 90
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    yPos += 10; // Reducido de 14 a 10

    // Comentario (texto más pequeño)
    doc.fontSize(12) // Reducido de 13 a 12
       .fillColor(this.colors.text)
       .font('Helvetica')
       .text(data.comment, 50, yPos, { width: 495, align: 'justify', lineGap: 4 }); // lineGap reducido de 6 a 4

    yPos = doc.y + 12; // Reducido de 18 a 12

    // Títulos con bullets minimalistas (más compactos)
    if (data.degrees && data.degrees.length > 0) {
      data.degrees.forEach((degree: string) => {
        doc.fontSize(11) // Reducido de 13 a 11
           .fillColor(this.colors.text)
           .font('Helvetica')
           .text(`•`, 50, yPos, { continued: true })
           .text(` ${degree}`, { lineGap: 3 }); // lineGap reducido de 6 a 3
        yPos += 20; // Reducido de 26 a 20
      });
    }

    return yPos + sectionPadding;
  }

  private addSkillsSection(doc: PDFKit.PDFDocument, data: any, yPos: number): number {
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    const sectionPadding = 20; // Reducido de 32 a 20

    // Título de sección - h2 (14px semibold) - REDUCIDO
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('COMPETENCIAS Y HABILIDADES', 50, yPos, { width: 380 });

    // Badge de coincidencia con fondo pastel azul (más pequeño)
    const badgeWidth = 50; // Reducido de 55 a 50
    const badgeHeight = 20; // Reducido de 22 a 20
    const badgeX = 545 - badgeWidth;
    doc.roundedRect(badgeX, yPos - 2, badgeWidth, badgeHeight, 4)
       .fillAndStroke(this.colors.accentBlue, this.colors.border);

    doc.fontSize(11) // Reducido de 12 a 11
       .fillColor(this.colors.secondary)
       .font('Helvetica-Bold')
       .text(`${data.match}%`, badgeX, yPos + 1, { width: badgeWidth, align: 'center' });

    // Línea decorativa sutil (más corta)
    yPos += 18; // Reducido de 22 a 18
    doc.moveTo(50, yPos)
       .lineTo(50 + 150, yPos) // Reducido de 190 a 150
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    yPos += 10; // Reducido de 14 a 10

    // Comentario (texto más pequeño)
    doc.fontSize(12) // Reducido de 13 a 12
       .fillColor(this.colors.text)
       .font('Helvetica')
       .text(data.comment, 50, yPos, { width: 495, align: 'justify', lineGap: 4 }); // lineGap reducido de 6 a 4

    yPos = doc.y + 12; // Reducido de 18 a 12

    // Habilidades identificadas con formato limpio (más compactas)
    if (data.cvSkills && data.cvSkills.length > 0) {
      doc.fontSize(11) // Reducido de 13 a 11
         .fillColor(this.colors.titleMedium)
         .font('Helvetica-Bold')
         .text('Habilidades Identificadas:', 50, yPos);

      yPos += 16; // Reducido de 22 a 16

      const skills = data.cvSkills.join(' • ');
      doc.fontSize(11) // Reducido de 13 a 11
         .fillColor(this.colors.text)
         .font('Helvetica')
         .text(skills, 50, yPos, { width: 495, lineGap: 3 }); // lineGap reducido de 6 a 3

      yPos = doc.y + 10; // Reducido de 14 a 10
    }

    return yPos + sectionPadding;
  }

  private addAffinitySection(doc: PDFKit.PDFDocument, data: any, yPos: number): number {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    const sectionPadding = 20; // Reducido de 32 a 20

    // Título de sección - h2 (14px semibold) - REDUCIDO
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('AFINIDAD CON EL PUESTO', 50, yPos, { width: 380 });

    // Badge de coincidencia con fondo pastel coral (más pequeño)
    const badgeWidth = 50; // Reducido de 55 a 50
    const badgeHeight = 20; // Reducido de 22 a 20
    const badgeX = 545 - badgeWidth;
    doc.roundedRect(badgeX, yPos - 2, badgeWidth, badgeHeight, 4)
       .fillAndStroke(this.colors.accentCoral, this.colors.border);

    doc.fontSize(11) // Reducido de 12 a 11
       .fillColor(this.colors.primaryDark)
       .font('Helvetica-Bold')
       .text(`${data.match}%`, badgeX, yPos + 1, { width: badgeWidth, align: 'center' });

    // Línea decorativa sutil (más corta)
    yPos += 18; // Reducido de 22 a 18
    doc.moveTo(50, yPos)
       .lineTo(50 + 140, yPos) // Reducido de 170 a 140
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    yPos += 10; // Reducido de 14 a 10

    // Comentario (texto más pequeño)
    doc.fontSize(12) // Reducido de 13 a 12
       .fillColor(this.colors.text)
       .font('Helvetica')
       .text(data.comment, 50, yPos, { width: 495, align: 'justify', lineGap: 4 }); // lineGap reducido de 6 a 4

    return doc.y + sectionPadding;
  }

  private addRecommendation(doc: PDFKit.PDFDocument, data: PdfSummaryData) {
    let yPos = doc.y;

    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    const leftMargin = 50;
    const boxPadding = 16; // Reducido de 20 a 16
    const contentWidth = 495;
    const boxHeight = 100; // Reducido de 130 a 100

    // Tarjeta completa con línea lateral coral (3px) y fondo neutro
    doc.rect(50, yPos, contentWidth, boxHeight)
       .fill(this.colors.accent);

    // Línea lateral izquierda coral de 3px
    doc.moveTo(50, yPos)
       .lineTo(50, yPos + boxHeight)
       .strokeColor(this.colors.primarySoft)
       .lineWidth(3)
       .stroke();

    // Título de la sección integrado DENTRO del bloque con padding-top (REDUCIDO)
    const titleY = yPos + boxPadding;
    doc.fontSize(14) // Reducido de 16 a 14
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('RECOMENDACIÓN FINAL', leftMargin + boxPadding, titleY);

    // Línea decorativa coral bajo el título (más corta)
    const lineY = titleY + 18; // Reducido de 24 a 18
    doc.moveTo(leftMargin + boxPadding, lineY)
       .lineTo(leftMargin + boxPadding + 120, lineY) // Reducido de 150 a 120
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    // Texto de recomendación (más compacto)
    const textY = lineY + 10; // Reducido de 14 a 10
    doc.fontSize(12) // Reducido de 13 a 12
       .fillColor(this.colors.text)
       .font('Helvetica')
       .text(data.recommendation, leftMargin + boxPadding, textY, {
         width: contentWidth - (boxPadding * 2),
         align: 'justify',
         lineGap: 4 // Reducido de 7 a 4
       });

    // Actualizar posición Y después del bloque
    doc.y = yPos + boxHeight + 20; // Reducido de 32 a 20
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const bottomY = 705;
    const footerMarginBottom = 16; // Margen inferior de 16px

    // Línea divisoria gris clara más visible
    doc.moveTo(50, bottomY)
       .lineTo(545, bottomY)
       .strokeColor(this.colors.footerBorder)
       .lineWidth(1.5)
       .stroke();

    let footerY = bottomY + 16;

    // Información de contacto de Elevas Consulting
    doc.fontSize(9)
       .fillColor(this.colors.titleDark)
       .font('Helvetica-Bold')
       .text('Lic. Elisa Lo Gioco – Fundadora de Elevas Consulting', 50, footerY, {
         align: 'center',
         width: 445
       });

    footerY += 15;

    // Teléfono y email
    doc.fontSize(8)
       .fillColor(this.colors.textLight)
       .font('Helvetica')
       .text('+54 9 2901 647084  |  info@elevasconsulting.com', 50, footerY, {
         align: 'center',
         width: 445
       });

    footerY += 13;

    // Website
    doc.fontSize(8)
       .fillColor(this.colors.primary)
       .font('Helvetica')
       .text('www.elevasconsulting.com', 50, footerY, {
         align: 'center',
         width: 445,
         link: 'https://www.elevasconsulting.com'
       });

    // Logo Elevas (reducido 10%, centrado verticalmente)
    const logoPath = path.join(process.cwd(), 'public', 'logoelevas.png');
    if (fs.existsSync(logoPath)) {
      const logoWidth = 45; // Reducido de 50 a 45 (10% menos)
      const logoX = 495;
      const logoY = bottomY + 12; // Centrado verticalmente en el footer
      doc.image(logoPath, logoX, logoY, { width: logoWidth });
    }

    // Nota: El margen inferior de 16px está implícito por la posición del footer
    // La página tiene suficiente espacio entre el footer y el borde inferior
  }
}
