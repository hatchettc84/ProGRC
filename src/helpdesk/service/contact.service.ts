import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { HelpdeskContactType } from "src/entities/helpdesk.entity";
import { User } from "src/entities/user.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { EmailService } from "src/notifications/email.service";
import { Repository } from "typeorm/repository/Repository";

interface contactRequest {
    subject: string;
    message: string;
    contactType: HelpdeskContactType;
}

@Injectable()
export class ContactService {
    constructor(
        private readonly emailService: EmailService,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepository: Repository<CustomerCsm>,
        private readonly configService: ConfigService,
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>
    ) { }

    async sendFromCustomer(customerId: string, data: contactRequest): Promise<void> {
        const customer: Customer = await this.getCustomerById(customerId);
        const cc: string[] = await this.getCustomerCsmEmails(customerId);
        const subject: string = this.generateSubject(data.contactType, data.subject, customer);
        await this.emailService.sendEmail(this.configService.get('HELP_DESK_EMAIL'), cc, subject, data.message);
    }

    private async getCustomerById(customerId: string): Promise<Customer> {
        if (!customerId) {
            throw new BadRequestException('You not belong to any organization');
        }
        return await this.customerRepository.findOneOrFail({ where: { id: customerId } });
    }

    private async getCustomerCsmEmails(customerId: string): Promise<string[]> {
        const customerCsms: CustomerCsm[] = await this.customerCsmRepository.find({
            where: { customer_id: customerId, role_id: UserRole.CSM },
            relations: ['user']
        });
        return customerCsms.map(csm => csm.user.email);
    }

    private generateSubject(contactType: HelpdeskContactType, subject: string, customer: Customer): string {
        let prefix: string;
        switch (contactType) {
            case HelpdeskContactType.FEATURE_REQUEST:
                prefix = 'Feature Request';
                break;
            case HelpdeskContactType.SUPPORT_REQUEST:
                prefix = 'Need Support';
                break;
            default:
                prefix = 'General';
        }

        return `${prefix} From ${customer.organization_name}: ${subject}`;
    }
}
