import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/createVendor.dto';
import { UpdateVendorDto } from './dto/updateVendor.dto';
import { CreateVendorReviewDto } from './dto/createVendorReview.dto';
import { UpdateVendorReviewDto } from './dto/updateVendorReview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../masterData/userRoles.entity';
import { StandardResponse } from '../common/dto/standardResponse.dto';

@ApiTags('Vendors')
@Controller('vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Get all vendors for the organization' })
  @ApiResponse({ status: 200, description: 'List of vendors' })
  async findAll(@Req() req: any): Promise<StandardResponse<any>> {
    const vendors = await this.vendorService.findAll(req['user_data']);
    return StandardResponse.success('Vendors retrieved successfully', vendors);
  }

  @Get(':id')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<StandardResponse<any>> {
    const vendor = await this.vendorService.findOne(req['user_data'], id);
    return StandardResponse.success('Vendor retrieved successfully', vendor);
  }

  @Post()
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  async create(
    @Req() req: any,
    @Body() createVendorDto: CreateVendorDto,
  ): Promise<StandardResponse<any>> {
    const vendor = await this.vendorService.create(req['user_data'], createVendorDto);
    return StandardResponse.success('Vendor created successfully', vendor, '201');
  }

  @Put(':id')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Update vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<StandardResponse<any>> {
    const vendor = await this.vendorService.update(req['user_data'], id, updateVendorDto);
    return StandardResponse.success('Vendor updated successfully', vendor);
  }

  @Delete(':id')
  @Roles(UserRole.OrgAdmin)
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<StandardResponse<void>> {
    await this.vendorService.remove(req['user_data'], id);
    return StandardResponse.success('Vendor deleted successfully', null);
  }

  @Get(':id/reviews')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Get all reviews for a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'List of vendor reviews' })
  async getReviews(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<StandardResponse<any>> {
    const reviews = await this.vendorService.getReviews(req['user_data'], id);
    return StandardResponse.success('Vendor reviews retrieved successfully', reviews);
  }

  @Get(':id/reviews/stats')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Get review statistics for a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor review statistics' })
  async getReviewStats(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<StandardResponse<any>> {
    const stats = await this.vendorService.getReviewStats(req['user_data'], id);
    return StandardResponse.success('Review statistics retrieved successfully', stats);
  }

  @Post(':id/reviews')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Create a new vendor review' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 201, description: 'Vendor review created successfully' })
  async createReview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() createReviewDto: CreateVendorReviewDto,
  ): Promise<StandardResponse<any>> {
    const review = await this.vendorService.createReview(
      req['user_data'],
      id,
      createReviewDto,
    );
    return StandardResponse.success('Vendor review created successfully', review, '201');
  }

  @Put(':id/reviews/:reviewId')
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
  @ApiOperation({ summary: 'Update vendor review' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Vendor review updated successfully' })
  async updateReview(
    @Req() req: any,
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateVendorReviewDto,
  ): Promise<StandardResponse<any>> {
    const review = await this.vendorService.updateReview(
      req['user_data'],
      id,
      reviewId,
      updateReviewDto,
    );
    return StandardResponse.success('Vendor review updated successfully', review);
  }

  @Delete(':id/reviews/:reviewId')
  @Roles(UserRole.OrgAdmin)
  @ApiOperation({ summary: 'Delete vendor review' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Vendor review deleted successfully' })
  async deleteReview(
    @Req() req: any,
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
  ): Promise<StandardResponse<void>> {
    await this.vendorService.deleteReview(req['user_data'], id, reviewId);
    return StandardResponse.success('Vendor review deleted successfully', null);
  }
}

