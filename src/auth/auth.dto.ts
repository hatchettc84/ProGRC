import { IsNotEmpty, IsString } from "class-validator";

export class ValidateResetPasswordRequest {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    email: string;
}

export class ChangePasswordResetRequest {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}

export class SetInitialPasswordRequest {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    id: string;
}
