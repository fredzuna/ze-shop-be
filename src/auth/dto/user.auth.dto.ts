import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserAuthDto {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field()
  address: string;
}
