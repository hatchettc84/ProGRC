import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { EntityNotFoundError } from "typeorm";
import { Repository } from "typeorm/repository/Repository";
import { LogoUpdateRequest, LogoUpdateResponse } from "../customer.dto";

interface updateField {
    name: string;
    license: string;
}

@Injectable()
export class UpdateCustomerService {
    constructor(
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>
    ) { }

    async updateCustomer(userInfo: { userId: string }, id: string, updatedData: updateField): Promise<void> {
        const result = await this.customerRepository.update({ id }, {
            organization_name: updatedData.name,
            license_type: updatedData.license,
            updated_by: userInfo.userId,
            updated_at: new Date()
        });

        if (result.affected === 0) {
            throw new EntityNotFoundError(Customer, 'Customer not found');
        }
    }

    async updateCustomerNotes(userInfo: { userId: string }, id: string, notes: string): Promise<void> {
        const result = await this.customerRepository.update({ id }, {
            notes,
            updated_by: userInfo.userId,
            updated_at: new Date()
        });

        if (result.affected === 0) {
            throw new EntityNotFoundError(Customer, 'Customer not found');
        }
    }

    async updateCustomerLogo(userInfo, data: LogoUpdateRequest): Promise<LogoUpdateResponse> {
            const customerId = userInfo['customerId'];
            const customer = await this.customerRepository.findOne({ where: { id: customerId } });
            if(!data || !data.uuid) {
                throw new BadRequestException({
                    error: 'Invalid request',
                    message: 'Invalid request',
                });
            }
    
            if(data.uuid !== customerId) {
                throw new ForbiddenException({
                    error: 'Invalid user',
                    message: 'Invalid user',
                });
            }

            if(!customer.temp_logo_image_key) {
                throw new BadRequestException({
                    error: 'No temp logo to update',
                    message: 'No temp logo to update',
                });
            }
    
            customer.logo_image_key = customer.temp_logo_image_key;
            customer.temp_logo_image_key = null;
            customer.logo_updated_at = new Date();
            customer.is_logo_available = true;
            await this.customerRepository.save(customer);
            return new LogoUpdateResponse(true, data.uuid);
    
        } 
}
