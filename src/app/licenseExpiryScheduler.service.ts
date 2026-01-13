import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { UserRole, UserRoles } from 'src/masterData/userRoles.entity';
import { PlanExpired, PlanExpiryCSM, PlanUpcomingExpiry} from 'src/notifications/templates/progrc-email';
import { EmailService } from 'src/notifications/email.service';
import { EmailValidationService } from 'src/auth/emailValidation.service';

@Injectable()
export class LicenseExpiryScheduler {

    private readonly emailSendingDays = [2, 10, 15];

    constructor(
        @InjectRepository(LicenseType) private readonly licenseTypeRepo: Repository<LicenseType>,
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepository: Repository<CustomerCsm>,

        private readonly logger: LoggerService,
        private readonly emailService: EmailService,
        private readonly emailValidationService: EmailValidationService,
    ) { }

    @Cron('0 0 * * *')
    async handleCron() {

        // for now expiring only trial licenses
        const customers = await this.customerRepository.find({ where: { license_type_id: 6 } });

        for (const customer of customers) {
            // Skip if license_end_date is null or undefined
            if (!customer.license_end_date) {
                this.logger.warn(`Customer ${customer.id} has no license_end_date, skipping`);
                continue;
            }

            const expiryDate = new Date(customer.license_end_date);
            
            // Validate the date is valid
            if (isNaN(expiryDate.getTime())) {
                this.logger.error(`Invalid license_end_date for customer ${customer.id}: ${customer.license_end_date}`);
                continue;
            }

            if (expiryDate < new Date()) {
                this.logger.info(`Expiring trial license for customer ${customer.id}`);
                await this.expireTrialLicense(customer);
            } else {
                // else get the difference in days and send email to customer and csm
                const diffTime = Math.abs(expiryDate.getTime() - new Date().getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (this.emailSendingDays.includes(diffDays)) {
                    this.logger.info(`Sending email to customer ${customer.id} for license expiry in ${diffDays} days`);
                    await this.sendEmails(customer, diffDays);
                }
            }
        }
    }

    private async expireTrialLicense(customer: Customer) {
        const customerCsms = await this.customerCsmRepository.find({ where: { customer_id: customer.id }, relations: ['user'] });
        const user = await this.userRepository.findOne({ where: { customer_id: customer.id, role_id: 3 } });
        await this.customerRepository.manager.transaction(async (transactionalEntityManager) => {
            customer.license_type_id = 7;
            await transactionalEntityManager.save(customer);
        });
        // send license expired email to admin
        try {
            this.emailValidationService.validateEmail(user.email);
            const emailBodyAdmin = PlanExpired({
                adminName: user.name
            });
            this.emailService.sendEmail(user.email, [], 'ProGRC - License Expired. Action Required!', emailBodyAdmin);
        } catch (error) {
            this.logger.error(`Invalid email ${user.email} for admin ${customer.id}, cannot send license expiry email`);
        }

        for (const csm of customerCsms) {
            const emailBodyCsm = PlanExpiryCSM({
                orgName: customer.organization_name,
                orgId: customer.id,
                adminEmail: user.email,
                expiryDays: 0,
            });
            try {
                this.emailValidationService.validateEmail(csm.user.email);
                this.emailService.sendEmail(csm.user.email, [], 'ProGRC - License Expired. Action Required!', emailBodyCsm);
            } catch (error) {
                this.logger.error(`Invalid email ${user.email} for csm of ${customer.id}, cannot send upcoming license expiry email`);
            }
        }

    }

    private async sendEmails(customer: Customer, diffDays: number) {
        const customerCsms = await this.customerCsmRepository.find({ where: { customer_id: customer.id, role_id: UserRole.CSM }, relations: ['user'] });
        const user = await this.userRepository.findOne({ where: { customer_id: customer.id, role_id: 3 } });

        // send email to customer admin
        const emailBodyAdmin = PlanUpcomingExpiry({
            adminName: user.name,
            expiryDays: diffDays,
        });

        try {
            this.emailValidationService.validateEmail(user.email);
            this.emailService.sendEmail(user.email, [], 'ProGRC - License is about to Expire. Action Required!', emailBodyAdmin);
        } catch (error) {
            this.logger.error(`Invalid email ${user.email} for customer ${customer.id}, cannot send upcoming license expiry email before ${diffDays} days`);
        }

        // send email to csm
        for (const csm of customerCsms) {
            const emailBodyCsm = PlanExpiryCSM({
                orgName: customer.organization_name,
                orgId: customer.id,
                adminEmail: user.email,
                expiryDays: diffDays,
            });
            try {
                this.emailValidationService.validateEmail(csm.user.email);
                this.emailService.sendEmail(csm.user.email, [], 'ProGRC - License is about to Expire. Action Required!', emailBodyCsm);
            } catch (error) {
                this.logger.error(`Invalid email ${user.email} for csm of ${customer.id}, cannot send upcoming license expiry email before ${diffDays} days`);
            }
        }

    }

}

