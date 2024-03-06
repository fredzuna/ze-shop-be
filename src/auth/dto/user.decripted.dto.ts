import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDecrypted {  
  email: string;  
  sub: number;
  iat: number;
  exp: number;
}