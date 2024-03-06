import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { LoginStrategy } from './login.strategy';
import { UserRole } from '../entities/user-role.entity';

@Module({
  imports: [    
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '120m' }, // adjust token expiration as needed
    }),
    TypeOrmModule.forFeature([User, UserRole])
  ],
  controllers: [AuthController],
  providers: [LoginStrategy, JwtStrategy, AuthService, UserService],  
})
export class AuthModule {}
