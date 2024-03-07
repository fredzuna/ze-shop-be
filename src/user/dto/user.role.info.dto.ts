import { Field, ObjectType } from '@nestjs/graphql';
import { UserRoleDto } from './user.role.dto';

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
