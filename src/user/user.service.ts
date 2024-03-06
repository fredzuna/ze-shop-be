import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UserAuthDto } from '../auth/dto/user.auth.dto';
import { UserRoleInfoDto } from './dto/user.role.info.dto';
import { EditUserRoleDto } from './dto/edit-user-role.dto';
import { UserRole } from 'src/entities/user-role.entity';
import { Role } from 'src/entities/role.entity';

interface CreateUserRolesInput {
  userId: number;
  roleId: number
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) { }

  async create(user: CreateUserDto): Promise<User> {
    const { email, password, address } = user;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user entity
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      address
    });

    // Save the user to the database
    return this.userRepository.save(newUser);
  }



  async createOrUpdateUserRoles(userRoles: DeepPartial<UserRole>[]): Promise<UserRole[]> {
    const newUserRole = this.userRoleRepository.create(userRoles);
    return await this.userRoleRepository.save(newUserRole);
  }

  async editUserRoles(userRoleInput: EditUserRoleDto): Promise<UserRole[]> {
    const { userId, roles } = userRoleInput;
    return this.userRoleRepository.manager.transaction(async (manager: EntityManager) => {
      try {
        // Find the user by ID
        const user = await manager.findOne(User, { where: { id: userId } });

        if (!user) {
          // Handle the case where the user is not found
          console.error('User not found for ID:', userId);
          return [];
        }

        // Use repository method for deletion
        await manager.delete(UserRole, {  user: user  });

        // Fetch roles in a single query
        const rolesToCreate = await manager.findBy(Role, { id: In(roles) })

        // Create and add new user roles concurrently
        const newRoles = await Promise.all(
          rolesToCreate.map(async (role) => {
            const newUserRole = manager.create(UserRole, {
              user: user,
              role: role,
            });
            return newUserRole;
          })
        );

        // Save the new user roles
        const createdUserRoles = await manager.save(UserRole, newRoles);

        return createdUserRoles;
      } catch (error) {
        // Handle transaction error (rollback will be automatic)
        console.error('Transaction error:', error.message);
        throw error;
      }
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        email
      }
    });
  }

  findAll(): Promise<UserAuthDto[]> {
    return this.userRepository.find({ select: ['id', 'email', 'address'] });
  }

  async getUserProfile(email: string): Promise<UserAuthDto | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        email
      },
      select: ['id', 'email', 'address']
    });

    return user;
  }

  async getUsersAndRoles(): Promise<UserRoleInfoDto[] | undefined> {
    const users = await this.userRepository.find({ select: ['id', 'email', 'address'], relations: ['userRoles', 'userRoles.role'] });
    return users;
  }

  async getUserRoleById(id: number): Promise<UserRoleInfoDto> {
    const user = await this.userRepository.findOne({ select: ['id', 'email', 'address'], where: { id }, relations: ['userRoles', 'userRoles.role'] });
    return user;
  }
}
