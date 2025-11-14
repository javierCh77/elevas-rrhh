import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class PasswordResetService {
  // Generate a secure random token
  generateResetToken(): { token: string; hashedToken: string } {
    // Generate 32 random bytes and convert to hex
    const token = randomBytes(32).toString('hex');

    // Hash the token for storage (this is what we store in DB)
    const hashedToken = createHash('sha256').update(token).digest('hex');

    return {
      token, // This is sent to the user
      hashedToken // This is stored in the database
    };
  }

  // Hash a token for comparison with stored hash
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Generate token expiration time (1 hour from now)
  generateExpirationTime(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
  }

  // Check if token has expired
  isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  // Validate token format (should be 64 hex characters)
  isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/i.test(token);
  }
}