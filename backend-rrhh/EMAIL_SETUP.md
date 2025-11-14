# Configuración de Envío de Emails

## Configuración del Sistema de Mensajería

El sistema de mensajería permite enviar emails a los candidatos desde la vista [http://localhost:3001/dashboard/recruitment/messages](http://localhost:3001/dashboard/recruitment/messages).

## Configuración SMTP

Para que los emails funcionen correctamente, debes configurar un servidor SMTP en el archivo `.env` del backend.

### Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar la autenticación de dos factores** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Copia la contraseña generada (16 caracteres)

3. **Configurar en `.env`**:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion-de-16-caracteres
MAIL_FROM=noreply@elevas.com
```

### Opción 2: Mailtrap (Para testing sin envíos reales)

[Mailtrap](https://mailtrap.io/) es ideal para testing ya que captura todos los emails sin enviarlos realmente.

1. Crea una cuenta gratuita en [mailtrap.io](https://mailtrap.io/)
2. Copia las credenciales SMTP de tu inbox

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_SECURE=false
MAIL_USER=tu-username-mailtrap
MAIL_PASSWORD=tu-password-mailtrap
MAIL_FROM=noreply@elevas.com
```

### Opción 3: SendGrid (Para producción)

SendGrid ofrece 100 emails gratuitos por día.

1. Crea una cuenta en [SendGrid](https://sendgrid.com/)
2. Genera una API Key
3. Configura:

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
MAIL_FROM=noreply@tu-dominio.com
```

### Opción 4: Amazon SES (Para producción a escala)

AWS SES es ideal para volúmenes grandes.

```env
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-access-key-id
MAIL_PASSWORD=tu-secret-access-key
MAIL_FROM=noreply@tu-dominio-verificado.com
```

## Información de la Empresa

Configura estos valores para personalizar los emails:

```env
COMPANY_NAME=Elevas RRHH
RECRUITER_NAME=Equipo de Recursos Humanos
```

## Estructura del Email

Los emails enviados incluyen:

- **Header**: Con el nombre de la empresa en gradiente naranja/amber
- **Body**: El contenido del mensaje con formato HTML
- **Footer**: Información de copyright y aviso de email automático

## Plantillas Disponibles

El sistema incluye 6 plantillas predefinidas:

1. **Invitación a Entrevista**: Para convocar candidatos a entrevistas
2. **Rechazo de Candidatura**: Notificación de rechazo cortés
3. **Oferta de Trabajo**: Envío de oferta formal
4. **Seguimiento**: Actualización del estado del proceso
5. **Solicitud de Información**: Pedir documentación adicional
6. **Agradecimiento por Entrevista**: Follow-up post-entrevista

## Variables de Plantilla

Las plantillas soportan las siguientes variables que se reemplazan automáticamente:

- `{{candidateName}}` - Nombre completo del candidato
- `{{firstName}}` - Nombre
- `{{lastName}}` - Apellido
- `{{email}}` - Email del candidato
- `{{jobTitle}}` - Título del puesto
- `{{recruiterName}}` - Nombre del reclutador (de .env)
- `{{companyName}}` - Nombre de la empresa (de .env)
- `{{currentDate}}` - Fecha actual en formato DD/MM/YYYY

## Probar el Envío

1. Asegúrate de que el backend esté corriendo: `npm run start:dev`
2. Ve a [http://localhost:3001/dashboard/recruitment/messages](http://localhost:3001/dashboard/recruitment/messages)
3. Selecciona un candidato
4. Elige una plantilla
5. Personaliza el mensaje
6. Haz clic en "Enviar Mensaje"

## Troubleshooting

### El email no se envía

- Verifica que las credenciales SMTP sean correctas
- Revisa los logs del backend para ver errores específicos
- Asegúrate de que no haya firewall bloqueando el puerto SMTP
- Si usas Gmail, confirma que la contraseña de aplicación esté correcta

### Email llega a spam

- Configura SPF, DKIM y DMARC en tu dominio
- Usa un servicio profesional como SendGrid o SES
- Evita palabras spam en el asunto
- Incluye un enlace de "darse de baja"

### Error de autenticación

- Si usas Gmail, verifica que la autenticación de dos factores esté habilitada
- Regenera la contraseña de aplicación
- Asegúrate de copiar la contraseña completa sin espacios

## Recomendaciones de Seguridad

- **NUNCA** compartas tu archivo `.env` en repositorios públicos
- Usa contraseñas de aplicación específicas, no tu contraseña principal
- Rota las credenciales regularmente
- Usa servicios con autenticación de dos factores
- Monitorea los logs de envío para detectar uso indebido

## Siguiente Paso

Para un sistema de producción, considera implementar:
- Cola de emails (Bull/BullMQ)
- Reintentos automáticos en caso de fallo
- Límite de tasa de envío
- Tracking de emails abiertos y clicks
- Almacenamiento de historial de emails en base de datos
