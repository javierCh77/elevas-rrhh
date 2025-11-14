import { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Consultoría Elevas - Cómo protegemos y manejamos tu información personal",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#6d381a]/70 hover:text-[#e4b53b] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-10 w-10 text-[#e4b53b]" />
          <h1 className="text-4xl font-light text-[#6d381a]">
            Política de <span className="font-normal text-[#e4b53b]">Privacidad</span>
          </h1>
        </div>

        <p className="text-sm text-[#6d381a]/60 mb-8">
          Última actualización: 10 de noviembre de 2025
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8 text-[#6d381a]">
            {/* Introducción */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">1. Introducción</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                En Consultoría Elevas, nos comprometemos a proteger tu privacidad y manejar tus datos personales
                con transparencia y seguridad. Esta Política de Privacidad explica cómo recopilamos, usamos,
                compartimos y protegemos tu información personal cuando utilizas nuestro sitio web y servicios.
              </p>
            </section>

            {/* Información que recopilamos */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">2. Información que Recopilamos</h2>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">2.1 Información que nos proporcionas</h3>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li>Nombre completo y apellido</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Empresa y cargo (opcional)</li>
                <li>CV y datos profesionales (en formularios de empleo)</li>
                <li>Mensajes y consultas enviadas a través de nuestros formularios</li>
              </ul>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">2.2 Información recopilada automáticamente</h3>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y tiempo de navegación</li>
                <li>Cookies y tecnologías similares</li>
              </ul>
            </section>

            {/* Cómo usamos la información */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">3. Cómo Usamos tu Información</h2>
              <p className="leading-relaxed text-[#6d381a]/80 mb-3">
                Utilizamos tu información personal para los siguientes propósitos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li>Responder a tus consultas y solicitudes de información</li>
                <li>Procesar aplicaciones de empleo</li>
                <li>Proporcionar nuestros servicios de consultoría en RRHH</li>
                <li>Enviar información sobre nuestros servicios (solo con tu consentimiento)</li>
                <li>Mejorar nuestro sitio web y experiencia del usuario</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            {/* Compartir información */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">4. Compartir tu Información</h2>
              <p className="leading-relaxed text-[#6d381a]/80 mb-3">
                No vendemos tu información personal. Podemos compartir tu información en las siguientes circunstancias:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar nuestro negocio
                (hosting, email, análisis)</li>
                <li><strong>Requisitos legales:</strong> Cuando la ley lo requiera o para proteger nuestros derechos</li>
                <li><strong>Consentimiento:</strong> Cuando hayas dado tu autorización explícita</li>
              </ul>
            </section>

            {/* Seguridad */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">5. Seguridad de Datos</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información
                personal contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4 mt-3">
                <li>Encriptación SSL/TLS para transmisión de datos</li>
                <li>Almacenamiento seguro de información</li>
                <li>Acceso restringido a datos personales</li>
                <li>Revisiones periódicas de seguridad</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">6. Cookies</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños
                archivos de texto que se almacenan en tu dispositivo. Puedes configurar tu navegador para rechazar
                cookies, aunque esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            {/* Tus derechos */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">7. Tus Derechos</h2>
              <p className="leading-relaxed text-[#6d381a]/80 mb-3">
                De acuerdo con la legislación argentina (Ley 25.326), tienes derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
              </ul>
              <p className="leading-relaxed text-[#6d381a]/80 mt-4">
                Para ejercer estos derechos, contáctanos en:
                <a href="mailto:info@elevasconsulting.com" className="text-[#e4b53b] hover:underline ml-1">
                  info@elevasconsulting.com
                </a>
              </p>
            </section>

            {/* Retención de datos */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">8. Retención de Datos</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Conservamos tu información personal solo durante el tiempo necesario para cumplir con los
                propósitos descritos en esta política o según lo requiera la ley. Los CVs y aplicaciones de
                empleo se conservan por 12 meses, salvo que solicites su eliminación.
              </p>
            </section>

            {/* Menores de edad */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">9. Menores de Edad</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente
                información personal de menores. Si descubrimos que hemos recopilado información de un menor,
                la eliminaremos de inmediato.
              </p>
            </section>

            {/* Cambios */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">10. Cambios a esta Política</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios
                significativos publicando la nueva política en esta página y actualizando la fecha de
                "Última actualización".
              </p>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">11. Contacto</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Si tienes preguntas sobre esta Política de Privacidad o el manejo de tus datos, contáctanos:
              </p>
              <div className="mt-4 p-6 bg-[#e4b53b]/10 rounded-lg">
                <p className="text-[#6d381a] font-medium">Consultoría Elevas</p>
                <p className="text-[#6d381a]/80">Las Margaritas 289, Ushuaia, Tierra del Fuego</p>
                <p className="text-[#6d381a]/80">
                  Email: <a href="mailto:info@elevasconsulting.com" className="text-[#e4b53b] hover:underline">
                    info@elevasconsulting.com
                  </a>
                </p>
                <p className="text-[#6d381a]/80">Teléfono: +54 9 (2901) 586685</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
