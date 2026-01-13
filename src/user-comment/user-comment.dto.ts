import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserComment {

    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsArray()
    @IsOptional()
    tags: string[];

    @IsNumber()
    @IsNotEmpty()
    app_id: number;

    @IsNumber()
    @IsNotEmpty()
    standard_id: number;

    @IsNumber()
    @IsOptional()
    control_id: number;

    @IsBoolean()
    @IsOptional()
    is_standard_level_comment: boolean;

}

export class UpdateUserComment {
    
    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsArray()
    @IsOptional()
    tags: string[];

}