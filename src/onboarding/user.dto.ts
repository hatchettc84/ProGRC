import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString } from "class-validator";
import exp from "constants";

export class ProfileImageUpdateRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    uuid: string;
}

export class ProfileImageUpdateResponse {
    updated: boolean;
    uuid: string;
    constructor(updated: boolean, uuid: string) {
        this.updated = updated;
        this.uuid = uuid;
    }
}

export class AddAuditorDto{
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    userId: string;

    @IsNotEmpty()
    @IsString()
    customerId: string;

    @IsNotEmpty()
    @IsInt()
    roleId: number;

}