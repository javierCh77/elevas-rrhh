import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (para producción considera Redis/Upstash)
const store = new Map<string, RateLimitStore>();

// Limpiar entradas antiguas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // en milisegundos
  maxRequests: number; // número máximo de requests
}

export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests } = config;

  return {
    check: (request: NextRequest, identifier?: string): { success: boolean; limit: number; remaining: number; reset: number } => {
      // Usar IP o identificador personalizado
      const id = identifier || request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
      const now = Date.now();

      const record = store.get(id);

      if (!record || now > record.resetTime) {
        // Primera request o ventana expirada
        store.set(id, {
          count: 1,
          resetTime: now + interval,
        });

        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests - 1,
          reset: now + interval,
        };
      }

      // Incrementar contador
      record.count++;

      if (record.count > maxRequests) {
        // Rate limit excedido
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: record.resetTime,
        };
      }

      // Request permitida
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - record.count,
        reset: record.resetTime,
      };
    },
  };
}

// Configuraciones predefinidas
export const rateLimiters = {
  // Para chatbot: 10 requests por minuto por IP
  chat: rateLimit({
    interval: 60 * 1000, // 1 minuto
    maxRequests: 10,
  }),

  // Para formulario de contacto: 3 requests por 5 minutos por IP
  contact: rateLimit({
    interval: 5 * 60 * 1000, // 5 minutos
    maxRequests: 3,
  }),
};
