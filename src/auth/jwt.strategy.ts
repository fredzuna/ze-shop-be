// jwt.strategy.ts
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserDecrypted } from './dto/user.decripted.dto';
import { UserService } from '../user/user.service';
import { UserAuthDto } from './dto/user.auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: UserDecrypted): Promise<UserAuthDto> {    
    try {
      const user = await this.userService.findByEmail(payload.email);
  
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }
  
      const { password, ...authUser} = user;
      return authUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
