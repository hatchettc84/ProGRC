import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class HtmlContentDto {
    @ApiProperty({
        description: 'The HTML content of the policy',
        example: '<h1>Access Control Policy</h1><div class="section"><h2>Document Information</h2></div>'
    })
    @IsString()
    @IsNotEmpty()
    htmlContent: string;
}

export class ContentDto {
    @ApiProperty({
        description: 'The HTML content object',
        type: HtmlContentDto
    })
    @IsObject()
    @IsNotEmpty()
    htmlContent: HtmlContentDto;
}

export class UpdatePolicyContentDto {
    @ApiProperty({
        description: 'The content object containing HTML content',
        type: ContentDto,
        example: {
            htmlContent: {
                htmlContent: '<h1>Access Control Policy</h1><div class="section"><h2>Document Information</h2></div>'
            }
        }
    })
    @IsObject()
    @IsNotEmpty()
    content: ContentDto;

    @ApiProperty({
        description: 'Version of the policy',
        example: '1.0.0'
    })
    @IsString()
    @IsOptional()
    version?: string;

    @ApiProperty({
        description: 'Description of the policy',
        example: 'Updated policy description'
    })
    @IsString()
    @IsOptional()
    description?: string;
}