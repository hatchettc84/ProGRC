import { PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './createVendor.dto';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}

