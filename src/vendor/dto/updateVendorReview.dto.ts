import { PartialType } from '@nestjs/swagger';
import { CreateVendorReviewDto } from './createVendorReview.dto';

export class UpdateVendorReviewDto extends PartialType(CreateVendorReviewDto) {}

