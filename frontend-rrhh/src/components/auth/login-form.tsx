'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type LoginCredentials } from '@/lib/auth'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Mail, Lock, Loader2, Users, TrendingUp, Award, Briefcase } from 'lucide-react'
import Image from 'next/image'

export default function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(credentials)
      // Don't manually redirect - let RouteGuard handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #fefcf5 0%, #fdf7e6 30%, #ffffff 70%, #f9f9f9 100%)'
    }}>
      {/* Left Side - Modern Futuristic Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(253, 247, 230, 0.9) 50%, rgba(250, 237, 199, 0.85) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Animated Geometric Network */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-32 left-32 w-0.5 h-64 rotate-12 animate-float" style={{
            background: 'linear-gradient(to bottom, transparent, #cfaf6e, #a37d43, transparent)',
            boxShadow: '0 0 8px rgba(207, 175, 110, 0.4)',
            animationDuration: '4s'
          }}></div>
          <div className="absolute bottom-32 right-32 w-64 h-0.5 rotate-12 animate-float" style={{
            background: 'linear-gradient(to right, transparent, #cfaf6e, #a37d43, transparent)',
            boxShadow: '0 0 8px rgba(207, 175, 110, 0.4)',
            animationDelay: '2s',
            animationDuration: '5s'
          }}></div>
          <div className="absolute top-1/2 left-16 w-12 h-12 border-2 rotate-45" style={{
            borderColor: '#cfaf6e',
            boxShadow: '0 0 12px rgba(207, 175, 110, 0.3)',
            animation: 'spin 20s linear infinite'
          }}></div>
          <div className="absolute top-1/3 right-1/3 w-6 h-6 border-2 rounded-full animate-pulse" style={{
            borderColor: '#cfaf6e',
            boxShadow: '0 0 10px rgba(207, 175, 110, 0.5)',
            animationDelay: '1s'
          }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-3 h-16 rotate-45 animate-pulse" style={{
            background: 'linear-gradient(to bottom, #cfaf6e, transparent)',
            animationDelay: '3s'
          }}></div>
        </div>

        {/* Advanced Floating Orbs */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-20 right-20 w-40 h-40 rounded-full animate-float" style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(207, 175, 110, 0.7) 0%, rgba(207, 175, 110, 0.4) 30%, rgba(207, 175, 110, 0.2) 60%, transparent 100%)',
            boxShadow: '0 0 30px rgba(207, 175, 110, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)',
            animationDuration: '8s'
          }}></div>
          <div className="absolute bottom-24 left-24 w-32 h-32 rounded-full animate-float" style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(244, 228, 193, 0.8) 0%, rgba(244, 228, 193, 0.5) 30%, rgba(244, 228, 193, 0.3) 60%, transparent 100%)',
            boxShadow: '0 0 25px rgba(244, 228, 193, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.3)',
            animationDelay: '3s',
            animationDuration: '6s'
          }}></div>
          <div className="absolute top-2/3 right-16 w-24 h-24 rounded-full animate-bounce" style={{
            background: 'radial-gradient(circle, rgba(163, 125, 67, 0.6) 0%, rgba(163, 125, 67, 0.3) 50%, transparent 80%)',
            boxShadow: '0 0 20px rgba(163, 125, 67, 0.3)',
            animationDelay: '1.5s',
            animationDuration: '4s'
          }}></div>
          <div className="absolute top-16 left-1/3 w-28 h-28 rounded-full animate-pulse" style={{
            background: 'radial-gradient(circle, rgba(207, 175, 110, 0.5) 0%, rgba(207, 175, 110, 0.3) 40%, transparent 80%)',
            boxShadow: '0 0 22px rgba(207, 175, 110, 0.4)',
            animationDelay: '4s'
          }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full animate-float" style={{
            background: 'radial-gradient(circle, rgba(244, 228, 193, 0.6) 0%, rgba(244, 228, 193, 0.2) 60%, transparent 100%)',
            boxShadow: '0 0 18px rgba(244, 228, 193, 0.3)',
            animationDelay: '5s',
            animationDuration: '7s'
          }}></div>
        </div>

        {/* Animated Particles System */}
        <div className="absolute inset-0 opacity-60">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, #cfaf6e 0%, rgba(207, 175, 110, 0.4) 100%)`,
                boxShadow: '0 0 8px rgba(207, 175, 110, 0.6)',
                top: `${15 + (i * 10)}%`,
                left: `${10 + (i * 8)}%`,
                animationDelay: `${i * 0.4}s`
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={`float-${i}`}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                background: `radial-gradient(circle, #a37d43 0%, rgba(163, 125, 67, 0.3) 100%)`,
                boxShadow: '0 0 6px rgba(163, 125, 67, 0.5)',
                top: `${25 + (i * 8)}%`,
                right: `${15 + (i * 6)}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: '4s'
              }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                background: '#cfaf6e',
                boxShadow: '0 0 4px rgba(207, 175, 110, 0.8)',
                top: `${40 + (i * 12)}%`,
                left: `${60 + (i * 5)}%`,
                animationDelay: `${i * 0.7}s`
              }}
            />
          ))}
        </div>

        {/* Glowing Accent Lines */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/3 left-0 w-full h-0.5 animate-glow-pulse" style={{
            background: 'linear-gradient(to right, transparent, rgba(207, 175, 110, 0.8), rgba(244, 228, 193, 0.6), transparent)',
            boxShadow: '0 0 10px rgba(207, 175, 110, 0.4)'
          }}></div>
          <div className="absolute bottom-1/3 left-0 w-full h-0.5 animate-glow-pulse" style={{
            background: 'linear-gradient(to right, transparent, rgba(244, 228, 193, 0.7), rgba(207, 175, 110, 0.5), transparent)',
            boxShadow: '0 0 8px rgba(244, 228, 193, 0.3)',
            animationDelay: '2s'
          }}></div>
          <div className="absolute top-2/3 left-0 w-full h-px animate-glow-pulse" style={{
            background: 'linear-gradient(to right, transparent, rgba(207, 175, 110, 0.6), transparent)',
            boxShadow: '0 0 6px rgba(207, 175, 110, 0.3)',
            animationDelay: '4s'
          }}></div>
        </div>

        {/* Modern Content Layout */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full max-w-md mx-auto">

          {/* Logo + Typography Combined */}
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center gap-6">
              {/* Premium Logo */}
              <div className="relative w-30 h-30 rounded-2xl flex items-center justify-center group transition-all duration-500 hover:scale-105 drop-shadow-md ring-2 ring-elevas-primary-100 flex-shrink-0" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 245, 0.95) 100%)',
                backdropFilter: 'blur(25px)',
                border: '2px solid rgba(207, 175, 110, 0.3)',
                boxShadow: '0 12px 35px rgba(207, 175, 110, 0.2), 0 6px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>
                <Image
                  src="/logoelevas.png"
                  alt="Elevas - Gestión de Talento Humano"
                  width={96}
                  height={96}
                  className="object-contain transition-all duration-500 group-hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12)) drop-shadow(0 2px 4px rgba(207,175,110,0.2))'
                  }}
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{
                  background: 'radial-gradient(circle at center, rgba(207, 175, 110, 0.3) 0%, transparent 70%)',
                  filter: 'blur(8px)'
                }}></div>
              </div>

              {/* Typography */}
              <div className="space-y-3 flex-1">
               
                <h1 className="text-3xl font-light leading-tight tracking-tight" style={{
                  color: '#1a1a1a',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  Gestión de
                  <span className="block font-bold text-4xl bg-gradient-to-r from-[#cfaf6e] to-[#a37d43] bg-clip-text text-transparent">
                    Talento Humano
                  </span>
                </h1>
                <div className="w-16 h-0.5 rounded-full" style={{
                  background: 'linear-gradient(to right, #cfaf6e, #a37d43)'
                }}></div>
              </div>
            </div>

            <p className="text-lg leading-relaxed font-medium" style={{
              color: '#424242',
              textShadow: '0 1px 2px rgba(0,0,0,0.08)',
              lineHeight: '1.7'
            }}>
              Plataforma moderna para optimizar la gestión de equipos y el desarrollo del talento
            </p>

            {/* Features integradas */}
            <div className="mt-12 space-y-6" style={{animationDelay: '0.4s'}}>
              {[
              { icon: Users, label: 'Gestión de Equipos', desc: 'Organiza y coordina equipos' },
              { icon: TrendingUp, label: 'Analytics', desc: 'Métricas y insights' },
              { icon: Award, label: 'Evaluaciones', desc: 'Desempeño y feedback' },
              { icon: Briefcase, label: 'Reclutamiento', desc: 'Atracción de talento' }
            ].map((feature, i) => (
              <div
                key={feature.label}
                className="flex items-center space-x-4 group cursor-pointer transition-all duration-300 hover:translate-x-2"
                style={{ animationDelay: `${(i + 6) * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(207, 175, 110, 0.3)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <feature.icon
                    className="w-5 h-5 transition-all duration-300"
                    style={{color: '#424242'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#cfaf6e'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#424242'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>{feature.label}</div>
                  <div className="text-xs font-medium" style={{
                    color: '#424242',
                    textShadow: '0 1px 1px rgba(0,0,0,0.04)'
                  }}>{feature.desc}</div>
                </div>
              </div>
              ))}
            </div>

          {/* Minimalist Accent */}
          <div className="mt-12 opacity-30">
            <div className="flex space-x-1">
              <div className="w-8 h-0.5 rounded-full" style={{background: '#cfaf6e'}}></div>
              <div className="w-4 h-0.5 rounded-full" style={{background: '#cfaf6e'}}></div>
              <div className="w-2 h-0.5 rounded-full" style={{background: '#cfaf6e'}}></div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 min-h-screen">
        <div className="w-full max-w-sm space-y-6 animate-slide-up delay-300">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(207, 175, 110, 0.4)',
              boxShadow: '0 8px 25px rgba(207, 175, 110, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <Image
                src="/logoelevas.png"
                alt="Elevas Logo"
                width={58}
                height={58}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold" style={{color: '#cfaf6e'}}>Elevas</h1>
          </div>

          {/* Card */}
          <Card className="border-0 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl" style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 25px -8px rgba(207, 175, 110, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
          }}>
            <CardHeader className="space-y-3 text-center pb-4">
              {/* Subtle icon */}
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(207, 175, 110, 0.1), rgba(207, 175, 110, 0.05))',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <Lock className="w-4 h-4" style={{color: '#cfaf6e'}} />
                </div>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-wide bg-gradient-to-r from-[#cfaf6e] to-[#a37d43] bg-clip-text text-transparent">
                Bienvenido
              </CardTitle>
              <CardDescription className="text-base" style={{
                color: '#666666',
                lineHeight: '1.6'
              }}>
                Accede a tu cuenta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold" style={{color: '#424242'}}>
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" style={{color: '#9e9e9e'}} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@elevas.com"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-12 h-12 border-2 transition-all duration-200 rounded-lg"
                      style={{
                        borderColor: '#eeeeee',
                        backgroundColor: '#fafafa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#eeeeee'
                        e.target.style.boxShadow = 'none'
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold" style={{color: '#424242'}}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" style={{color: '#9e9e9e'}} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-12 pr-12 h-12 border-2 transition-all duration-200 rounded-lg"
                      style={{
                        borderColor: '#eeeeee',
                        backgroundColor: '#fafafa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#eeeeee'
                        e.target.style.boxShadow = 'none'
                      }}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 transition-colors duration-200 cursor-pointer"
                      style={{color: '#9e9e9e'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#666666'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9e9e9e'
                      }}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <Alert variant="destructive" className="border-elevas-red-200 bg-elevas-red-50">
                    <AlertDescription className="text-elevas-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 text-white font-semibold rounded-md transition-all duration-300 transform hover:-translate-y-1 focus:ring-2 focus:ring-offset-1 focus:outline-none active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: '#cfaf6e',
                    borderColor: '#cfaf6e',
                    boxShadow: '0 4px 14px 0 rgba(207, 175, 110, 0.3), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#a37d43'
                    e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(163, 125, 67, 0.4), 0 4px 8px 0 rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#cfaf6e'
                    e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(207, 175, 110, 0.3), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                      <span className="text-white">Iniciando sesión...</span>
                    </>
                  ) : (
                    <span className="text-white font-semibold">Iniciar Sesión</span>
                  )}
                </Button>
              </form>

              {/* Additional Options */}
              <div className="mt-6 pt-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm" style={{color: '#666666'}}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#cfaf6e] focus:ring-[#cfaf6e] focus:ring-offset-0"
                    />
                    <span>Recordarme</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium transition-colors duration-200 hover:underline cursor-pointer"
                    style={{color: '#cfaf6e'}}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3">
            <div className="text-sm" style={{color: '#9e9e9e'}}>
              <p>© 2025 Elevas. Todos los derechos reservados.</p>
            </div>
            <div className="text-xs flex items-center justify-center gap-1" style={{color: '#bdbdbd'}}>
              <span>Powered by</span>
              <a
                href="https://www.argix.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-all duration-200 hover:underline cursor-pointer"
                style={{color: '#cfaf6e'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a37d43'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#cfaf6e'
                }}
              >
                Argix
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
