import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { VendorReview, ReviewStatus } from '../entities/vendorReview.entity';
import { CreateVendorDto } from './dto/createVendor.dto';
import { UpdateVendorDto } from './dto/updateVendor.dto';
import { CreateVendorReviewDto } from './dto/createVendorReview.dto';
import { UpdateVendorReviewDto } from './dto/updateVendorReview.dto';
import { Customer } from '../entities/customer.entity';
import { StandardResponse } from '../common/dto/standardResponse.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(VendorReview)
    private readonly vendorReviewRepo: Repository<VendorReview>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(userInfo: any): Promise<Vendor[]> {
    const customerId = userInfo.customerId || userInfo.tenant_id;
    if (!customerId) {
      throw new ForbiddenException('Customer ID is required');
    }

    return this.vendorRepo.find({
      where: { customerId, deleted: false },
      relations: ['reviews', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userInfo: any, id: string): Promise<Vendor> {
    const customerId = userInfo.customerId || userInfo.tenant_id;
    const vendor = await this.vendorRepo.findOne({
      where: { id, deleted: false },
      relations: ['reviews', 'reviews.reviewer', 'creator', 'customer'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    if (vendor.customerId !== customerId) {
      throw new ForbiddenException('Access denied to this vendor');
    }

    return vendor;
  }

  async create(userInfo: any, createVendorDto: CreateVendorDto): Promise<Vendor> {
    const customerId = userInfo.customerId || userInfo.tenant_id;
    const userId = userInfo.userId;

    if (!customerId) {
      throw new ForbiddenException('Customer ID is required');
    }

    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const vendor = this.vendorRepo.create({
      ...createVendorDto,
      customerId,
      createdBy: userId,
      status: createVendorDto.status || VendorStatus.PENDING,
    });

    return this.vendorRepo.save(vendor);
  }

  async update(
    userInfo: any,
    id: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const customerId = userInfo.customerId || userInfo.tenant_id;
    const userId = userInfo.userId;

    const vendor = await this.findOne(userInfo, id);

    Object.assign(vendor, {
      ...updateVendorDto,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return this.vendorRepo.save(vendor);
  }

  async remove(userInfo: any, id: string): Promise<void> {
    const vendor = await this.findOne(userInfo, id);
    vendor.deleted = true;
    await this.vendorRepo.save(vendor);
  }

  async getReviews(userInfo: any, vendorId: string): Promise<VendorReview[]> {
    await this.findOne(userInfo, vendorId);

    return this.vendorReviewRepo.find({
      where: { vendorId, deleted: false },
      relations: ['reviewer', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async createReview(
    userInfo: any,
    vendorId: string,
    createReviewDto: CreateVendorReviewDto,
  ): Promise<VendorReview> {
    const userId = userInfo.userId;
    await this.findOne(userInfo, vendorId);

    const review = this.vendorReviewRepo.create({
      ...createReviewDto,
      vendorId,
      createdBy: userId,
      status: createReviewDto.status || ReviewStatus.PENDING,
      reviewDate: createReviewDto.reviewDate
        ? new Date(createReviewDto.reviewDate)
        : new Date(),
      nextReviewDate: createReviewDto.nextReviewDate
        ? new Date(createReviewDto.nextReviewDate)
        : null,
    });

    return this.vendorReviewRepo.save(review);
  }

  async updateReview(
    userInfo: any,
    vendorId: string,
    reviewId: string,
    updateReviewDto: UpdateVendorReviewDto,
  ): Promise<VendorReview> {
    const userId = userInfo.userId;
    await this.findOne(userInfo, vendorId);

    const review = await this.vendorReviewRepo.findOne({
      where: { id: reviewId, vendorId, deleted: false },
    });

    if (!review) {
      throw new NotFoundException('Vendor review not found');
    }

    Object.assign(review, {
      ...updateReviewDto,
      reviewedBy: userId,
      reviewDate: updateReviewDto.reviewDate
        ? new Date(updateReviewDto.reviewDate)
        : review.reviewDate,
      nextReviewDate: updateReviewDto.nextReviewDate
        ? new Date(updateReviewDto.nextReviewDate)
        : review.nextReviewDate,
      updatedAt: new Date(),
    });

    return this.vendorReviewRepo.save(review);
  }

  async deleteReview(userInfo: any, vendorId: string, reviewId: string): Promise<void> {
    await this.findOne(userInfo, vendorId);

    const review = await this.vendorReviewRepo.findOne({
      where: { id: reviewId, vendorId, deleted: false },
    });

    if (!review) {
      throw new NotFoundException('Vendor review not found');
    }

    review.deleted = true;
    await this.vendorReviewRepo.save(review);
  }

  async getReviewStats(userInfo: any, vendorId: string): Promise<any> {
    await this.findOne(userInfo, vendorId);

    const reviews = await this.vendorReviewRepo.find({
      where: { vendorId, deleted: false },
    });

    const stats = {
      total: reviews.length,
      completed: reviews.filter((r) => r.status === ReviewStatus.COMPLETED).length,
      pending: reviews.filter((r) => r.status === ReviewStatus.PENDING).length,
      inProgress: reviews.filter((r) => r.status === ReviewStatus.IN_PROGRESS).length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviews.length
          : 0,
      averageRiskScore:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.riskScore || 0), 0) / reviews.length
          : 0,
    };

    return stats;
  }
}

