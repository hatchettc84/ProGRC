import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TrustCenter, TrustCenterStatus } from "src/entities/trustCenter.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class GetTrustCenterService {
    constructor(
        @InjectRepository(TrustCenter) private readonly trustCenterRepository: Repository<TrustCenter>
    ) { }

    getForApp(userInfo: { customerId: string }, appId: number): Promise<TrustCenter[]> {
        return this.trustCenterRepository.find({
            where: {
                app_id: appId,
                customer_id: userInfo.customerId,
                status: In([TrustCenterStatus.SUCCESS, TrustCenterStatus.PROCESSING, TrustCenterStatus.PENDING]),
                deleted : false,
            },
            order: {
                created_at: 'desc'
            },
            relations: ['updated_by_user']
        });
    }
}
