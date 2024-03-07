import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  dateCreated: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  public role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  public permission: Permission;
}
