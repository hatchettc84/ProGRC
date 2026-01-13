import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateConnectionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  applicationId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sourceTypeId: number;

  @ApiProperty()
  @IsNotEmpty()
  metadata: any;
}
