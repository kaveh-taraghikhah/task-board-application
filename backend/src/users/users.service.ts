import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { toPublicUser } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async list() {
    const rows = await this.users.find({ order: { createdAt: 'ASC' } });
    return rows.map(toPublicUser);
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const user = this.users.create({
      email,
      fullName: dto.fullName,
      role: dto.role,
      isActive: true,
      passwordHash: await argon2.hash(dto.password),
    });

    return toPublicUser(await this.users.save(user));
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const nextRole = dto.role ?? user.role;
    const nextActive = dto.isActive ?? user.isActive;
    const wouldRemoveOwnerAccess =
      user.role === UserRole.Owner && (nextRole !== UserRole.Owner || nextActive === false);

    if (wouldRemoveOwnerAccess) {
      await this.assertNotLastActiveOwner();
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    return toPublicUser(await this.users.save(user));
  }

  private async assertNotLastActiveOwner(): Promise<void> {
    const activeOwners = await this.users.count({
      where: { role: UserRole.Owner, isActive: true },
    });

    if (activeOwners <= 1) {
      throw new ForbiddenException('The last active owner cannot be disabled or downgraded.');
    }
  }
}
