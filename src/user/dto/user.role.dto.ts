import { Field, ObjectType } from '@nestjs/graphql';
import { RoleDto } from '../../role/dto/role.dto';

@ObjectType()
export class UserRoleDto {
  @Field()
  id: number;

  @Field(() => Date)
  createdDate: Date;

  @Field(() => RoleDto, { nullable: true })
  public role: RoleDto;
}
