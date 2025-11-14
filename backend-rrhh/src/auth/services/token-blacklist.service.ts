import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();
  private tokenExpiry = new Map<string, number>();

  blacklistToken(token: string, expiresAt: number): void {
    this.blacklistedTokens.add(token);
    this.tokenExpiry.set(token, expiresAt);

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();

    for (const [token, expiresAt] of this.tokenExpiry.entries()) {
      if (expiresAt < now) {
        this.blacklistedTokens.delete(token);
        this.tokenExpiry.delete(token);
      }
    }
  }

  // Clean up expired tokens every hour
  private readonly cleanupInterval = setInterval(() => {
    this.cleanupExpiredTokens();
  }, 60 * 60 * 1000); // 1 hour
}