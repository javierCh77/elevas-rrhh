"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface ServiceCardProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export default function ServiceCard({ id, title, description, icon }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/servicios/${id}`} className="block h-full">
        <Card className="h-full group bg-white border border-[#6d381a]/10 hover:border-[#e4b53b]/30 rounded-2xl overflow-hidden elevas-lift elevas-press elevas-shadow-sm hover:elevas-shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#f1df96]/40 rounded-2xl text-[#e4b53b] group-hover:bg-[#e4b53b] group-hover:text-white transition-all duration-300 elevas-shadow-xs elevas-scale-breath">
                {icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-medium text-[#6d381a] group-hover:text-[#e4b53b] transition-colors duration-300 leading-snug elevas-heading">
                  {title}
                </CardTitle>
                <div className="w-8 h-px bg-[#e4b53b]/50 group-hover:w-16 group-hover:bg-[#e4b53b] transition-all duration-500 mt-2"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-[#6d381a]/70 text-sm leading-relaxed mb-6 font-light elevas-body">
              {description}
            </CardDescription>
            <div className="flex items-center text-[#e4b53b] text-sm font-medium group-hover:text-[#6d381a] transition-colors duration-300">
              <span className="mr-2">Explorar servicio</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

