import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token debe ser una cadena válida' })
  @IsNotEmpty({ message: 'Token es requerido' })
  token: string;

  @IsString({ message: 'Contraseña debe ser una cadena válida' })
  @MinLength(6, { message: 'Contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  newPassword: string;
}