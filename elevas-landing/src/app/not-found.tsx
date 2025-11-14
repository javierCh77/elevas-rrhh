'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect for redirect
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d381a]/5 via-white to-[#e4b53b]/5 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold text-[#6d381a]/10 leading-none select-none">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-[#6d381a]">
            Página <span className="font-normal text-[#e4b53b]">No Encontrada</span>
          </h2>
          <p className="text-lg text-[#6d381a]/70 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Countdown Display */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#e4b53b]/10 rounded-full border border-[#e4b53b]/30">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#e4b53b] flex items-center justify-center">
                <span className="text-white text-xl font-bold">{countdown}</span>
              </div>
              <div
                className="absolute inset-0 rounded-full border-4 border-[#e4b53b] animate-ping"
                style={{ animationDuration: '1s' }}
              />
            </div>
            <p className="text-[#6d381a]/80 font-medium">
              Redirigiendo al inicio...
            </p>
          </div>
        </div>

        {/* Manual Navigation */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#6d381a] text-white rounded-lg hover:bg-[#6d381a]/90 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Ir al Inicio Ahora</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-sm text-[#6d381a]/60">
            ¿Necesitas ayuda? <Link href="/contacto" className="text-[#e4b53b] hover:underline">Contáctanos</Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <Link
            href="/servicios"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-[#6d381a]/70 hover:text-[#e4b53b] text-sm"
          >
            Servicios
          </Link>
          <Link
            href="/nosotros"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-[#6d381a]/70 hover:text-[#e4b53b] text-sm"
          >
            Nosotros
          </Link>
          <Link
            href="/careers"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-[#6d381a]/70 hover:text-[#e4b53b] text-sm"
          >
            Careers
          </Link>
        </div>
      </div>
    </div>
  );
}
