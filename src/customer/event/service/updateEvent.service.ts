import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEvent, CustomerEventType } from "src/entities/customerEvent.entity";
import { EntityNotFoundError, Repository } from "typeorm";

interface UpdateEventPayload {
    notes: string;
    done: boolean;
    date: Date;
    type: CustomerEventType;
}

@Injectable()
export class UpdateEventService {
    constructor(
        @InjectRepository(CustomerEvent) private readonly customEventRepository: Repository<CustomerEvent>,
    ) { }

    async updateCustomerEvent(userInfo: { userId: string }, customerId: string, eventId: number, updatedData: UpdateEventPayload): Promise<void> {
        const result = await this.customEventRepository.update({
            id: eventId,
            customer_id: customerId,
        }, {
            notes: updatedData.notes,
            done: updatedData.done,
            date: updatedData.date,
            type: updatedData.type,
            updated_by: userInfo.userId,
            updated_at: new Date()
        });

        if (result.affected === 0) {
            throw new EntityNotFoundError(CustomerEvent, 'Customer not found');
        }
    }
}
