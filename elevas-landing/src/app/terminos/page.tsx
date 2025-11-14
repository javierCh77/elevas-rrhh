import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos y condiciones de uso del sitio web de Consultoría Elevas",
};

export default function TerminosPage() {
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
          <FileText className="h-10 w-10 text-[#e4b53b]" />
          <h1 className="text-4xl font-light text-[#6d381a]">
            Términos de <span className="font-normal text-[#e4b53b]">Uso</span>
          </h1>
        </div>

        <p className="text-sm text-[#6d381a]/60 mb-8">
          Última actualización: 10 de noviembre de 2025
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8 text-[#6d381a]">
            {/* Aceptación */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">1. Aceptación de los Términos</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Al acceder y utilizar el sitio web de Consultoría Elevas (elevasconsulting.com o elevas.com),
                aceptas estar sujeto a estos Términos de Uso y todas las leyes y regulaciones aplicables.
                Si no estás de acuerdo con alguno de estos términos, no debes utilizar este sitio.
              </p>
            </section>

            {/* Uso del sitio */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">2. Uso del Sitio Web</h2>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">2.1 Licencia de Uso</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                Se te concede una licencia limitada, no exclusiva, no transferible y revocable para acceder
                y utilizar este sitio web para fines personales y no comerciales.
              </p>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">2.2 Restricciones</h3>
              <p className="leading-relaxed text-[#6d381a]/80 mb-3">
                Al utilizar este sitio, te comprometes a NO:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4">
                <li>Utilizar el sitio de manera ilegal o fraudulenta</li>
                <li>Interferir con el funcionamiento del sitio o servidores</li>
                <li>Intentar obtener acceso no autorizado a sistemas o datos</li>
                <li>Copiar, reproducir o distribuir contenido sin autorización</li>
                <li>Utilizar robots, scrapers o herramientas automatizadas sin permiso</li>
                <li>Enviar spam o contenido malicioso</li>
                <li>Hacerse pasar por otra persona o entidad</li>
              </ul>
            </section>

            {/* Propiedad Intelectual */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">3. Propiedad Intelectual</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Todo el contenido de este sitio web, incluyendo texto, gráficos, logos, imágenes, videos,
                software y otros materiales, es propiedad de Consultoría Elevas o de sus proveedores de
                contenido y está protegido por las leyes de propiedad intelectual de Argentina y tratados
                internacionales.
              </p>
              <p className="leading-relaxed text-[#6d381a]/80 mt-3">
                Las marcas "Elevas" y "Consultoría Elevas", así como todos los logos relacionados, son marcas
                registradas o en proceso de registro de nuestra propiedad.
              </p>
            </section>

            {/* Servicios */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">4. Servicios de Consultoría</h2>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">4.1 Información General</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                La información sobre nuestros servicios en este sitio es de carácter general e informativo.
                Los servicios específicos, términos y condiciones se establecerán en contratos individuales
                con cada cliente.
              </p>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">4.2 No Garantías Implícitas</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                La información proporcionada en este sitio no constituye asesoramiento profesional específico.
                Para obtener asesoramiento personalizado, debes contactarnos directamente.
              </p>
            </section>

            {/* Aplicaciones de Empleo */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">5. Aplicaciones de Empleo</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Al enviar tu CV o información profesional a través de nuestro sitio:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4 mt-3">
                <li>Garantizas que la información proporcionada es veraz y actualizada</li>
                <li>Autorizas a Elevas a utilizar tu información para procesos de selección</li>
                <li>Comprendes que el envío de tu CV no garantiza una entrevista o empleo</li>
                <li>Aceptas que podemos conservar tu información durante 12 meses</li>
              </ul>
            </section>

            {/* Enlaces externos */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">6. Enlaces a Sitios de Terceros</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Este sitio puede contener enlaces a sitios web de terceros. No somos responsables del contenido,
                políticas de privacidad o prácticas de sitios de terceros. El acceso a estos enlaces es bajo
                tu propio riesgo.
              </p>
            </section>

            {/* Limitación de responsabilidad */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">7. Limitación de Responsabilidad</h2>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">7.1 Disponibilidad del Sitio</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                No garantizamos que el sitio estará disponible de forma ininterrumpida o libre de errores.
                Nos reservamos el derecho de suspender, modificar o discontinuar el sitio en cualquier momento
                sin previo aviso.
              </p>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">7.2 Exclusión de Garantías</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                Este sitio se proporciona "tal cual" y "según disponibilidad". No ofrecemos garantías de ningún
                tipo, ya sean expresas o implícitas, incluyendo garantías de comerciabilidad, idoneidad para un
                propósito particular o no infracción.
              </p>

              <h3 className="text-xl font-medium text-[#6d381a] mb-3 mt-6">7.3 Daños</h3>
              <p className="leading-relaxed text-[#6d381a]/80">
                En ningún caso Consultoría Elevas será responsable de daños directos, indirectos, incidentales,
                especiales o consecuentes que resulten del uso o la imposibilidad de uso de este sitio.
              </p>
            </section>

            {/* Indemnización */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">8. Indemnización</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Aceptas indemnizar y eximir de responsabilidad a Consultoría Elevas, sus directores, empleados
                y agentes de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y
                gastos que surjan de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#6d381a]/80 ml-4 mt-3">
                <li>Tu uso y acceso al sitio</li>
                <li>Tu violación de estos Términos de Uso</li>
                <li>Tu violación de derechos de terceros</li>
              </ul>
            </section>

            {/* Privacidad */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">9. Privacidad</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                El uso de tu información personal está regido por nuestra{" "}
                <Link href="/privacidad" className="text-[#e4b53b] hover:underline">
                  Política de Privacidad
                </Link>
                , que forma parte integral de estos Términos de Uso.
              </p>
            </section>

            {/* Ley aplicable */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">10. Ley Aplicable y Jurisdicción</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Estos Términos de Uso se rigen por las leyes de la República Argentina. Cualquier disputa
                relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales
                competentes de Ushuaia, Tierra del Fuego, Argentina.
              </p>
            </section>

            {/* Modificaciones */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">11. Modificaciones</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Nos reservamos el derecho de modificar estos Términos de Uso en cualquier momento. Los cambios
                entrarán en vigor inmediatamente después de su publicación en este sitio. Tu uso continuado
                del sitio después de cualquier cambio constituye tu aceptación de los nuevos términos.
              </p>
            </section>

            {/* Divisibilidad */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">12. Divisibilidad</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Si alguna disposición de estos Términos de Uso se considera inválida o inaplicable, dicha
                disposición se eliminará o limitará en la medida mínima necesaria, y las disposiciones
                restantes continuarán en pleno vigor y efecto.
              </p>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-semibold text-[#6d381a] mb-4">13. Contacto</h2>
              <p className="leading-relaxed text-[#6d381a]/80">
                Si tienes preguntas sobre estos Términos de Uso, contáctanos:
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
