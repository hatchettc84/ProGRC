import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEvent } from "src/entities/customerEvent.entity";
import { EntityNotFoundError } from "typeorm";
import { Repository } from "typeorm/repository/Repository";

@Injectable()
export class DeleteEventService {
    constructor(
        @InjectRepository(CustomerEvent) private readonly customEventRepository: Repository<CustomerEvent>,
    ) { }

    async deleteCustomerEvent(customerId: string, eventId: number): Promise<void> {
        const result = await this.customEventRepository.delete({
            id: eventId,
            customer_id: customerId,
        });

        if (result.affected === 0) {
            throw new EntityNotFoundError(CustomerEvent, 'Customer not found');
        }
    }
}
