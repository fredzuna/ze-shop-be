import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity()
export class UserRole {  
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdDate: Date;

  @ManyToOne(() => User, (user) => user.userRoles, { cascade: true })
  public user: User

  @ManyToOne(() => Role, (role) => role.userRoles, { cascade: true })
  public role: Role
}
