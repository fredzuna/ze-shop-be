import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => UserRole, userRole => userRole.role)
  public userRoles: UserRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  public rolePermissions: RolePermission[];
}
