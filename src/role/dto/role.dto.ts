import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RoleDto {
  @Field()
  id: number;

  @Field()
  name: string;
}
