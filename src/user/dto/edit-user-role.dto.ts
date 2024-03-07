import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength, IsNumber, IsArray } from 'class-validator';

@InputType()
export class EditUserRoleDto {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @Field(() => [Number])
  @IsNotEmpty()
  @IsArray()
  @MinLength(1, { message: 'At least one role is required' })
  roles: number[];
}
