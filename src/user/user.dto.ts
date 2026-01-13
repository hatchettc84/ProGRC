import { BadRequestException } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/masterData/userRoles.entity";

export class createUserRequest {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    name: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    email: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    mobile?: string;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => {
        const validRoles = [UserRole.SuperAdmin, UserRole.CSM, UserRole.CSM_AUDITOR, UserRole.AUDITOR];
        if (!validRoles.includes(value)) {
            throw new BadRequestException("Invalid role_id");
        }
        return value;
    })
    roleId: number;
}
