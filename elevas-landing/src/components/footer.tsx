import Link from "next/link";
import { Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#6d381a] text-white py-16">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid gap-8 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6 text-[#e4b53b] elevas-heading">
              Elevas
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Especialistas en recursos humanos que combinan inteligencia artificial 
              con experiencia humana para transformar tu organización.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://ar.linkedin.com/company/elevas-consulting"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-[#e4b53b] text-white hover:text-[#6d381a] rounded-lg transition-all duration-300 elevas-lift elevas-press"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://www.instagram.com/elevasconsulting?igsh=amoydTk4cWJpbnM4"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-[#e4b53b] text-white hover:text-[#6d381a] rounded-lg transition-all duration-300 elevas-lift elevas-press"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#e4b53b] elevas-heading">
              Servicios
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/servicios"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Atracción y Selección
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Gestión del Talento
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Compensaciones
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Clima Organizacional
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Outsourcing RRHH
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#e4b53b] elevas-heading">
              Empresa
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/nosotros"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#e4b53b] elevas-heading">
              Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#e4b53b] mt-0.5 flex-shrink-0" />
                <div className="text-white/80">
                  <p>Las Margaritas 289</p>
                  <p>Ushuaia, Tierra del Fuego</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#e4b53b] flex-shrink-0" />
                <a
                  href="https://wa.me/5492901586685?text=Hola%20Elevas!%20Los%20contacto%20desde%20la%20web.%20Me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20sus%20servicios%20de%20RRHH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  +54 9 (2901) 586685
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#e4b53b] flex-shrink-0" />
                <a
                  href="mailto:info@elevasconsulting.com"
                  className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
                >
                  info@elevasconsulting.com
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm">
              &copy; {new Date().getFullYear()} Elevas Consulting. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/privacidad" 
                className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
              >
                Política de Privacidad
              </Link>
              <Link 
                href="/terminos" 
                className="text-white/80 hover:text-[#e4b53b] transition-colors duration-300"
              >
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
