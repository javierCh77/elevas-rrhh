import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @Column()
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: 'Status must be a valid user status' })
  status: UserStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  department?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Position must be a string' })
  @MaxLength(100, { message: 'Position must not exceed 100 characters' })
  position?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatarUrl?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt?: Date;

  @Column({ default: 0 })
  @Exclude({ toPlainOnly: true })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  lockedUntil?: Date;

  // Password Reset Fields
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations will be added when we create other entities
  // @OneToMany(() => Job, (job) => job.createdBy)
  // jobsCreated: Job[];

  // @OneToMany(() => Application, (application) => application.applicant)
  // applications: Application[];

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  async incrementLoginAttempts(): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockedUntil && this.lockedUntil < new Date()) {
      this.loginAttempts = 1;
      this.lockedUntil = undefined;
      return;
    }

    this.loginAttempts += 1;

    // If we've reached max attempts, lock the account
    if (this.loginAttempts >= 5 && !this.isLocked()) {
      this.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Lock for 2 hours
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = undefined;
    this.lastLoginAt = new Date();
  }
}