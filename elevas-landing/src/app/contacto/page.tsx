import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos para transformar tu gestión de recursos humanos. Estamos ubicados en Buenos Aires, Argentina. Solicita una demo o consulta sobre nuestros servicios de reclutamiento con IA.",
  keywords: ["contacto elevas", "consultoría RRHH", "demo elevas", "contacto recursos humanos", "Buenos Aires"],
  openGraph: {
    title: "Contacto | Elevas - Transformamos RRHH con IA",
    description: "Contáctanos para una demo personalizada de nuestros servicios de reclutamiento y gestión de talento con IA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Elevas - Transformamos RRHH con IA",
    description: "Contáctanos para una demo personalizada de nuestros servicios de reclutamiento y gestión de talento con IA",
  },
};

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const initialForm = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  servicio: "",
  mensaje: "",
};

export default function ContactoPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, servicio: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones simples
    if (!formData.nombre || !formData.email || !formData.servicio) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completá los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el mensaje');
      }

      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });

      setFormData(initialForm);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el mensaje.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-24 md:px-6 bg-white min-h-screen">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-slide-up">
            <span className="font-normal text-[#e4b53b] elevas-float">Contáctanos</span>
          </h1>
          <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-pulse-soft"></div>
          <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte a transformar tu departamento de RRHH con
            soluciones inteligentes y personalizadas
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Contact Info */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <div className="space-y-8">
              {[
                {
                  icon: <MapPin className="h-6 w-6 text-[#e4b53b] mt-1" />,
                  title: "Dirección",
                  text: (
                    <>
                      Las Margaritas 289 <br /> Ushuaia, Tierra del Fuego
                    </>
                  ),
                },
                {
                  icon: <Phone className="h-6 w-6 text-[#e4b53b] mt-1" />,
                  title: "Teléfono",
                  text: (
                    <>
                      +54 9 (2901) 586685 <br /> Lunes a Viernes, 9:00 - 18:00
                    </>
                  ),
                },
                {
                  icon: <Mail className="h-6 w-6 text-[#e4b53b] mt-1" />,
                  title: "Email",
                  text: (
                    <>
                      info@elevasconsulting.com <br />
                      talento@elevasconsulting.com
                    </>
                  ),
                },
              ].map(({ icon, title, text }, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  {icon}
                  <div>
                    <h3 className="text-lg font-medium text-[#6d381a]">
                      {title}
                    </h3>
                    <p className="text-[#6d381a]/80 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-[#e4b53b]/10 rounded-xl">
              <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                ¿Prefieres una llamada?
              </h3>
              <p className="text-[#6d381a]/80 mb-6 leading-relaxed">
                Agenda una consulta gratuita de 30 minutos con uno de nuestros
                especialistas en transformación digital de RRHH.
              </p>
              <Button className="w-full bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                Agendar llamada
              </Button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="bg-white p-8 rounded-xl shadow-sm border border-[#6d381a]/10"
          >
            <h2 className="text-2xl md:text-3xl font-light text-[#6d381a] mb-8">
              Envíanos un <span className="font-normal text-[#e4b53b]">mensaje</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 text-[#6d381a]">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="nombre" className="text-[#6d381a] font-medium">
                    Nombre completo *
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[#6d381a] font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="telefono" className="text-[#6d381a] font-medium">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="empresa" className="text-[#6d381a] font-medium">
                    Empresa
                  </Label>
                  <Input
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="servicio" className="text-[#6d381a] font-medium">
                  Servicio de interés *
                </Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.servicio}
                  required
                >
                <SelectTrigger className="text-[#6d381a] border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20">
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 shadow-lg border border-[#6d381a]/20">
                    {[
                      "Atracción y Selección de Talento",
                      "Gestión del Talento y Capacitación",
                      "Compensaciones y Marco Legal",
                      "Clima y Cultura Organizacional",
                      "Onboarding y Transiciones Laborales",
                      "Feedback y Desarrollo del Desempeño",
                      "Outsourcing de Recursos Humanos",
                      "Evaluaciones Psicotécnicas",
                      "Otro",
                    ].map((s) => (
                      <SelectItem key={s} value={s} className="text-[#6d381a] bg-white cursor-pointer hover:bg-[#e4b53b]/10">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="mensaje" className="text-[#6d381a] font-medium">
                  Mensaje
                </Label>
                <Textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="¿Cómo podemos ayudarte a transformar tu gestión de RRHH?"
                  rows={4}
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Enviando...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-white" />
                    ¡Enviado!
                  </>
                ) : (
                  "Enviar mensaje"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
