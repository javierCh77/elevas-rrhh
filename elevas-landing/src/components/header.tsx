"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import logoelevas from "../../public/logoelevas.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/servicios", label: "Servicios" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/careers", label: "Postulate" },
    { href: "/contacto", label: "Contacto" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="flex w-full h-16 sm:h-20 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logoelevas}
            alt="ELEVAS Logo"
            width={80}
            priority
            style={{ height: "auto" }}
            className="transition-all duration-300 hover:scale-105"
          />
        </Link>
        <nav className="hidden md:flex gap-8 lg:gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base font-medium transition-all duration-300 py-2 ${
                isActive(link.href)
                  ? "text-[#e4b53b]"
                  : "text-[#6d381a] hover:text-[#e4b53b]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e4b53b] rounded-full"
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="hidden md:flex bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium px-6 py-2.5 rounded-xl elevas-lift elevas-press elevas-shadow-sm"
          >
            <Link href="/contacto">Contáctanos</Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden h-11 w-11 border-[#6d381a]/30 hover:border-[#e4b53b] hover:bg-[#e4b53b]/10 transition-all duration-300"
              >
                <Menu className="h-5 w-5 text-[#6d381a]" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white p-6">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div className="flex flex-col gap-8 mt-12">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-xl font-medium transition-all duration-300 py-2 ${
                      isActive(link.href)
                        ? "text-[#e4b53b]"
                        : "text-[#6d381a] hover:text-[#e4b53b]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  asChild
                  onClick={() => setIsOpen(false)}
                  className="mt-6 bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium px-6 py-3 rounded-xl elevas-lift elevas-press elevas-shadow-sm"
                >
                  <Link href="/contacto">Contáctanos</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
