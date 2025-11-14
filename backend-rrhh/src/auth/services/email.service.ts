import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Restablecer contraseña - Sistema RRHH',
        template: 'reset-password',
        context: {
          name: userName,
          resetUrl,
          email,
          expireTime: '1 hora',
        },
      });

      console.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, userName: string, temporaryPassword: string): Promise<void> {
    const loginUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido al Sistema RRHH',
        template: 'welcome',
        context: {
          name: userName,
          email,
          temporaryPassword,
          loginUrl,
        },
      });

      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendContactFormEmail(contactData: {
    nombre: string;
    email: string;
    telefono?: string;
    empresa?: string;
    servicio: string;
    mensaje?: string;
  }): Promise<void> {
    const recipientEmail = this.configService.get<string>('MAIL_USER') || 'info@elevasconsulting.com';

    try {
      // Email para el equipo de Elevas
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: `Nuevo contacto: ${contactData.servicio}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #6d381a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📬 Nuevo mensaje de contacto</h1>
            </div>

            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #6d381a; border-bottom: 2px solid #e4b53b; padding-bottom: 10px;">Información del contacto</h2>

              <table style="width: 100%; margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #6d381a; width: 150px;">Nombre:</td>
                  <td style="padding: 10px;">${contactData.nombre}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; color: #6d381a;">Email:</td>
                  <td style="padding: 10px;"><a href="mailto:${contactData.email}" style="color: #e4b53b;">${contactData.email}</a></td>
                </tr>
                ${contactData.telefono ? `
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #6d381a;">Teléfono:</td>
                  <td style="padding: 10px;">${contactData.telefono}</td>
                </tr>
                ` : ''}
                ${contactData.empresa ? `
                <tr style="background-color: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; color: #6d381a;">Empresa:</td>
                  <td style="padding: 10px;">${contactData.empresa}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #6d381a;">Servicio:</td>
                  <td style="padding: 10px;"><span style="background-color: #e4b53b; color: white; padding: 4px 12px; border-radius: 4px;">${contactData.servicio}</span></td>
                </tr>
              </table>

              ${contactData.mensaje ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #6d381a; border-bottom: 2px solid #e4b53b; padding-bottom: 10px;">Mensaje:</h3>
                <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e4b53b; line-height: 1.6;">
                  ${contactData.mensaje}
                </p>
              </div>
              ` : ''}

              <div style="margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Fecha: ${new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>Este mensaje fue enviado desde el formulario de contacto de elevasconsulting.com</p>
            </div>
          </div>
        `,
      });

      console.log(`Contact form email sent successfully from ${contactData.email}`);
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw new Error('Failed to send contact form email');
    }
  }
}