import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateArticleRequest {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsNotEmpty()
    @IsString()
    keywords: string;

    @IsNotEmpty()
    @IsString()
    categoryKey: string;
}

export class UpdateArticleRequest {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsNotEmpty()
    @IsString()
    keywords: string;

    @IsNotEmpty()
    @IsString()
    categoryKey: string;

    @IsBoolean()
    @IsOptional()
    useAsGuide: boolean;
}

export class HelpCenterAskAiRequest {
    @IsNotEmpty()
    @IsString()
    query: string;
}
