import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEvent } from "src/entities/customerEvent.entity";
import { Between, Repository } from "typeorm";

@Injectable()
export class GetEventService {
    constructor(
        @InjectRepository(CustomerEvent) private readonly customerEventRepository: Repository<CustomerEvent>,
    ) { }

    async getCustomerEvents(customerId: string, startDate: Date, endDate: Date): Promise<CustomerEvent[]> {
        return this.customerEventRepository.find({
            where: {
                customer_id: customerId,
                date: Between(startDate, endDate)
            },
            relations: ['created_by_user']
        });
    }
}
