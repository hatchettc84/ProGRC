import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class SetRiskLevelV2Service {
    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly applicationControlMapRepo: Repository<ApplicationControlMapping>,
    ) { }

    async setForApplicationControls(
        userInfo: { userId: string, customerId: string },
        appId: number,
        controlIds: number[],
        riskLevel: string,
    ): Promise<void> {
        const uniqueIds = Array.from(new Set(controlIds));

        const controls: number = await this.applicationControlMapRepo.count({
            where: {
                app_id: appId,
                id: In(uniqueIds),
            }
        });

        if (controls !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }

        this.applicationControlMapRepo.update({
            app_id: appId,
            id: In(uniqueIds),
        }, {
            risk_level: riskLevel,
            updated_at: new Date(),
        })
    }


    async setReviewedStatusForApplicationControls(
        userInfo: { userId: string, customerId: string },
        appId: number,
        controlIds: number[],
        isReviewed: boolean,
    ): Promise<void> {
        const uniqueIds = Array.from(new Set(controlIds));

        const controls: number = await this.applicationControlMapRepo.count({
            where: {
                app_id: appId,
                id: In(uniqueIds),
            }
        });

        if (controls !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }

        this.applicationControlMapRepo.update({
            app_id: appId,
            id: In(uniqueIds),
        }, {
            is_reviewed: isReviewed,
            updated_at: new Date(),
        })
    }
}
