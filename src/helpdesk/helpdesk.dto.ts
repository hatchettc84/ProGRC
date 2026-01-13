import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { HelpdeskContactType } from "src/entities/helpdesk.entity";

export class HelpdeskContactRequest {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(HelpdeskContactType)
    contactType: HelpdeskContactType;
}
