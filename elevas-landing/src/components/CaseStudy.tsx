"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle } from "lucide-react";

const cases = [
  {
    id: 1,
    company: "Tech Solutions",
    challenge: "Alta rotación de empleados",
    solution: "Implementamos un programa de retención y desarrollo de talento.",
    result: "Redujimos la rotación en un 30% en 6 meses.",
  },
  {
    id: 2,
    company: "Finanzas Global",
    challenge: "Falta de digitalización en RRHH",
    solution: "Automatizamos procesos con IA y software de gestión.",
    result: "Mejoramos la eficiencia del equipo en un 40%.",
  },
  {
    id: 3,
    company: "Retail Express",
    challenge: "Problemas en la selección de personal",
    solution: "Optimizamos su proceso de reclutamiento con IA.",
    result: "Tiempo de contratación reducido en un 50%.",
  },
];

export default function CaseStudy() {
  return (
    <section className="py-20 bg-[#f8f8f8] px-6 md:px-20">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-[#6d381a]">Casos de Éxito</h2>
        <p className="text-lg text-[#6d381a]/80 max-w-lg mx-auto mt-2">
          Empresas que han transformado su gestión de talento con nuestra ayuda.
        </p>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {cases.map((caso) => (
          <div key={caso.id} className="p-6 bg-white rounded-2xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <Briefcase className="h-8 w-8 text-[#d98b5d]" />
              <h3 className="text-xl font-semibold text-[#6d381a]">
                {caso.company}
              </h3>
            </div>
            <p className="text-[#6d381a]/80">
              <strong>Desafío:</strong> {caso.challenge}
            </p>
            <p className="text-[#6d381a]/80">
              <strong>Solución:</strong> {caso.solution}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#d98b5d] font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>{caso.result}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
