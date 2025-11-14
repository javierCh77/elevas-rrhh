import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContactFormDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  empresa?: string;

  @IsNotEmpty({ message: 'El servicio es requerido' })
  @IsString()
  servicio: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensaje?: string;
}
