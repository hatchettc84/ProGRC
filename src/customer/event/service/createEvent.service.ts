import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { CustomerEvent, CustomerEventType } from "src/entities/customerEvent.entity";
import { Repository } from "typeorm/repository/Repository";

interface insertEvent {
    customerId: string;
    type: CustomerEventType;
    notes: string;
    date: Date;
    done: boolean;
}

@Injectable()
export class CreateEventService {
    constructor(
        @InjectRepository(CustomerEvent) private readonly customerEventRepository: Repository<CustomerEvent>,
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    ) { }

    async createEvent(userInfo: { userId: string }, data: insertEvent): Promise<void> {
        await this.customerRepository.findOneOrFail({ where: { id: data.customerId } });

        const event = this.customerEventRepository.create({
            customer_id: data.customerId,
            type: data.type,
            notes: data.notes,
            date: data.date,
            done: data.done,
            created_by: userInfo.userId,
            updated_by: userInfo.userId
        });
        await this.customerEventRepository.save(event);
    }
}
