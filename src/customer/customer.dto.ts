import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AssignCustomerCsmRequest {
    @ArrayNotEmpty()
    @IsArray()
    @IsString({ each: true })
    ids: string[];
}

export class UpdateCustomerMemberRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    mobile: string;

    @IsNumber()
    @IsNotEmpty()
    roleId: number;
}

export class LogoUpdateRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    uuid: string;
}

export class LogoUpdateResponse {
    updated: boolean;
    uuid: string;
    constructor(updated: boolean, uuid: string) {
        this.updated = updated;
        this.uuid = uuid;
    }
}