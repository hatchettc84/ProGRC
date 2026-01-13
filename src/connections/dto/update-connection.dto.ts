import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateConnectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  last_synced_at?: Date;
}
