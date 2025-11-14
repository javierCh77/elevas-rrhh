import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'position', 'phone', 'status', 'createdAt', 'updatedAt', 'lastLoginAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'position', 'phone', 'status', 'createdAt', 'updatedAt', 'lastLoginAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    const user = await this.findOne(id);
    user.status = status as UserStatus;
    return this.usersRepository.save(user);
  }

  // Password Reset Methods
  async updateResetToken(id: string, hashedToken: string, expiresAt: Date): Promise<void> {
    await this.usersRepository.update(id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });
  }

  async updatePasswordAndClearResetToken(
    id: string,
    hashedPassword: string,
    passwordChangedAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      password: hashedPassword,
      passwordChangedAt,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
