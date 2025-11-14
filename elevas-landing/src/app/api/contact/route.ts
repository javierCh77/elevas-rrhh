import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimiters } from '@/lib/rate-limit';

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests por 5 minutos
    const rateLimitResult = rateLimiters.contact.check(request);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Has enviado demasiados formularios. Por favor, espera unos minutos antes de intentar nuevamente.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { nombre, email, telefono, empresa, servicio, mensaje } = body;

    // Validaciones básicas
    if (!nombre || !email || !servicio) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Crear el HTML del email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #6d381a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📬 Nuevo mensaje de contacto</h1>
        </div>

        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #6d381a; border-bottom: 2px solid #e4b53b; padding-bottom: 10px;">Información del contacto</h2>

          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #6d381a; width: 150px;">Nombre:</td>
              <td style="padding: 10px;">${nombre}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; font-weight: bold; color: #6d381a;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${email}" style="color: #e4b53b;">${email}</a></td>
            </tr>
            ${telefono ? `
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #6d381a;">Teléfono:</td>
              <td style="padding: 10px;">${telefono}</td>
            </tr>
            ` : ''}
            ${empresa ? `
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; font-weight: bold; color: #6d381a;">Empresa:</td>
              <td style="padding: 10px;">${empresa}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #6d381a;">Servicio:</td>
              <td style="padding: 10px;"><span style="background-color: #e4b53b; color: white; padding: 4px 12px; border-radius: 4px;">${servicio}</span></td>
            </tr>
          </table>

          ${mensaje ? `
          <div style="margin-top: 20px;">
            <h3 style="color: #6d381a; border-bottom: 2px solid #e4b53b; padding-bottom: 10px;">Mensaje:</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e4b53b; line-height: 1.6;">
              ${mensaje}
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
    `;

    // Enviar el email
    await transporter.sendMail({
      from: `"Elevas Landing" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // El email llegará a talento@elevasconsulting.com
      replyTo: email, // Responder al email del usuario
      subject: `Nuevo contacto: ${servicio}`,
      html: htmlContent,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Mensaje enviado correctamente'
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error al enviar el mensaje',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
