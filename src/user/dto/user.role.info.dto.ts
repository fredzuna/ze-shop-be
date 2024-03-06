import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RoleDto } from "../../role/dto/role.dto";
import { UserRole } from "../../entities/user-role.entity";
import { UserRoleDto } from "./user.role.dto";

@ObjectType()
export class UserRoleInfoDto {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  address: string;

  @Field(() => [UserRoleDto], { nullable: true })
  userRoles?: UserRoleDto[];
}
