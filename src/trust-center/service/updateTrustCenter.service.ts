import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TrustCenter, TrustCenterStatus } from "src/entities/trustCenter.entity";
import { Repository } from "typeorm";

@Injectable()
export class UpdateTrustCenterService {
    constructor(
        @InjectRepository(TrustCenter)
        private readonly trustCenterRepository: Repository<TrustCenter>,
    ) { }

    async updateTrustCenter(
        userInfo: { userId: string; customerId: string },
        id: number,
        data: { name?: string; approvalDate?: Date; submissionDate?: Date },
    ): Promise<void> {
        await this.trustCenterRepository.findOneOrFail({
            where: {
                id,
                customer_id: userInfo.customerId,
                status: TrustCenterStatus.SUCCESS,
            },
            select: ['id'],
        });

        // Prepare the update data with only allowed fields
        const updateData: Partial<TrustCenter> = {};
        if (data.name) {
            updateData.name = data.name;
        }
        if (data.approvalDate) {
            updateData.approval_date = data.approvalDate;
        }
        if (data.submissionDate) {
            updateData.submission_date = data.submissionDate;
        }

        updateData.updated_at = new Date();
        updateData.updated_by = userInfo.userId;

        await this.trustCenterRepository.update(id, updateData);
    }
}
