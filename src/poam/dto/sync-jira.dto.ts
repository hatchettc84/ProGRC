import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class SyncJiraDto {
    @ApiProperty()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    poam_ids: number[];
}