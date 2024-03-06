import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional, IsNumber, IsArray } from 'class-validator';

@InputType()
export class EditUserRoleDto {
    @Field()
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @Field(type => [Number]) 
    @IsNotEmpty()
    @IsArray()    
    @MinLength(1, { message: 'At least one role is required' })
    roles: number[]; 
}
