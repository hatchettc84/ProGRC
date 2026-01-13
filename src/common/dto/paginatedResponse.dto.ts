import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse<T> {
    @ApiProperty({ description: 'Array of items for the current page' })
    items: T[];

    @ApiProperty({ description: 'Total number of items across all pages' })
    total: number;

    @ApiProperty({ description: 'Current page number' })
    page: number;

    @ApiProperty({ description: 'Number of items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;

    @ApiProperty({ description: 'Whether there is a next page' })
    hasNextPage: boolean;

    @ApiProperty({ description: 'Whether there is a previous page' })
    hasPreviousPage: boolean;
} 