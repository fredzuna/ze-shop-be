import { Controller, Post, Body, Request, UseGuards, Get, ConflictException, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginAuthGuard } from './login-auth.guard';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserAuthDto } from '../auth/dto/user.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    const existingUser = await this.userService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const {password, ...newUser } = await this.userService.create(createUserDto);
    return this.authService.login(newUser);
  }

  @UseGuards(LoginAuthGuard)  
  @Post('login')  
  async login(@Body(new ValidationPipe()) loginDto: LoginDto, @Request() req): Promise<{ access_token: string }> {
    const { user } = req;
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): Promise<UserAuthDto | undefined>  {        
    const user: UserAuthDto = req.user;
    return this.userService.getUserProfile(user.email);
  }
}
