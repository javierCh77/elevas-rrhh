import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { PasswordResetService } from './services/password-reset.service';
import { EmailService } from './services/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserStatus } from '../users/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: any;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private passwordResetService: PasswordResetService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user);

    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);

    const { password, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(userWithoutPassword);

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      // Decode token to get expiration time
      const decoded = this.jwtService.decode(token) as any;
      if (decoded && decoded.exp) {
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        this.tokenBlacklistService.blacklistToken(token, expiresAt);
      }
      return { message: 'Logout successful' };
    } catch (error) {
      // Even if token is invalid, consider logout successful
      return { message: 'Logout successful' };
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find user by email (case insensitive)
    const user = await this.usersService.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundException('No encontramos una cuenta asociada a este email');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('La cuenta está inactiva. Contacta al administrador');
    }

    // Generate reset token
    const { token, hashedToken } = this.passwordResetService.generateResetToken();
    const expiresAt = this.passwordResetService.generateExpirationTime();

    // Save hashed token and expiration to database
    await this.usersService.updateResetToken(user.id, hashedToken, expiresAt);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        token,
        user.fullName || `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Continue anyway - we don't want to reveal if the email failed to send
    }

    return {
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Validate token format
    if (!this.passwordResetService.isValidTokenFormat(token)) {
      throw new BadRequestException('Token de restablecimiento inválido');
    }

    // Hash the token to compare with stored hash
    const hashedToken = this.passwordResetService.hashToken(token);

    // Find user with this reset token
    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Token de restablecimiento inválido o expirado');
    }

    // Check if token has expired
    if (!user.resetPasswordExpires || this.passwordResetService.isTokenExpired(user.resetPasswordExpires)) {
      throw new BadRequestException('El token de restablecimiento ha expirado');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('La cuenta está inactiva. Contacta al administrador');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await this.usersService.updatePasswordAndClearResetToken(
      user.id,
      hashedPassword,
      new Date()
    );

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private async generateTokens(user: Partial<User>): Promise<AuthTokens> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Obtener el usuario
    const user = await this.usersService.findOne(userId);

    // Verificar que la contraseña actual sea correcta
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await this.usersService.update(userId, {
      password: hashedPassword
    });

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}
