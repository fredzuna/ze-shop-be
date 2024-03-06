import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAuthDto } from '../auth/dto/user.auth.dto';
import { UserRoleInfoDto } from './dto/user.role.info.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EditUserRoleDto } from './dto/edit-user-role.dto';
import { UserRoleDto } from './dto/user.role.dto';
import { RoleDto } from '../role/dto/role.dto';

@Resolver(of => User)
@UseGuards(JwtAuthGuard)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(returns => UserAuthDto)
    async user(@Args('email') email: string): Promise<UserAuthDto> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException(email);
        }

        const { password, ...userAuth } = user;
        return userAuth;
    }

    @Query(returns => [UserAuthDto])
    users(): Promise<UserAuthDto[]> {
        return this.userService.findAll();
    }

    @Query(returns => [UserRoleInfoDto], { name: 'usersRoles' })
    getUsersAndRoles(): Promise<UserRoleInfoDto[]> {
        return this.userService.getUsersAndRoles();
    }

    @Query(returns => UserRoleInfoDto, { name: 'userRole' })
    getUserRoleById(@Args('id', { type: () => Int }) id: number): Promise<UserRoleInfoDto> {
        return this.userService.getUserRoleById(id);
    }

    @Mutation(returns => UserAuthDto)
    async addUser(
        @Args('useInput') userInput: CreateUserDto,
    ): Promise<UserAuthDto> {
        const newUser = await this.userService.create(userInput);
        return {
            id: newUser.id,
            email: newUser.email,
            address: newUser.address
        }
    }

    @Mutation(returns => [UserRoleDto])
    async editUserRole(
        @Args('userRoleInput') userRoleInput: EditUserRoleDto,
    ): Promise<UserRoleDto[]> {
        const userRoles = await this.userService.editUserRoles(userRoleInput);

        return userRoles.map(userRole => ({
            id: userRole.id,
            createdDate: userRole.createdDate,
            role: userRole.role
        }))
    }
}
