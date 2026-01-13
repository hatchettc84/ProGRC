import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor } from '../entities/vendor.entity';
import { VendorReview } from '../entities/vendorReview.entity';
import { Customer } from '../entities/customer.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, VendorReview, User, Customer]),
    AuthModule,
  ],
  controllers: [VendorController],
  providers: [VendorService, LoggerService],
  exports: [VendorService],
})
export class VendorModule {}

