import { PartialType } from '@nestjs/swagger';
import { CreatePoamDto } from './create-poam.dto';

export class UpdatePoamDto extends PartialType(CreatePoamDto) {} 