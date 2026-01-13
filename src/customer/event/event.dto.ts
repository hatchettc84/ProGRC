import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { CustomerEventType } from "src/entities/customerEvent.entity";

export class CreateUpdateEventRequest {
    @IsString()
    @IsNotEmpty()
    type: CustomerEventType;

    @IsString()
    notes: string;

    @IsString()
    @IsNotEmpty()
    date: Date;

    @IsBoolean()
    @IsNotEmpty()
    done: boolean;
}
