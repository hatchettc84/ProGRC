import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { Repository } from "typeorm";

@Injectable()
export class DeleteTrustCenterService {
    constructor(
        @InjectRepository(TrustCenter) private readonly trustCenterRepository: Repository<TrustCenter>,
    ) { }

    async delete(userInfo: { userId: string; customerId: string }, id: number): Promise<void> {
        const trustCenter = await this.trustCenterRepository.findOneOrFail({
            where: {
                id,
                customer_id: userInfo.customerId,
            },
        });

        await this.trustCenterRepository.delete(trustCenter.id);
    }
}
