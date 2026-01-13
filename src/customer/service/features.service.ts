import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Features } from "src/entities/features.entity";
import { Repository } from "typeorm";
import { CreateFeatureRequest, FeatureResponse } from "../features.dto";

@Injectable()
export class FeaturesService {
    constructor(
        @InjectRepository(Features) private readonly featuresRepository: Repository<Features>
    ) { }

    async getFeaturesByCustomerId(customerId: string): Promise<FeatureResponse[]> {
        const features = await this.featuresRepository.find({
            where: { customer_id: customerId }
        });
        return features;
    }

    async createOrUpdateFeature(data: CreateFeatureRequest): Promise<FeatureResponse> {
        let feature = await this.featuresRepository.findOne({
            where: {
                customer_id: data.customer_id,
                key: data.key
            }
        });

        if (feature) {
            feature.flag = data.flag;
        } else {
            feature = this.featuresRepository.create(data);
        }

        return await this.featuresRepository.save(feature);
    }

    async deleteFeatureByKey(key: string): Promise<void> {
        const result = await this.featuresRepository.delete({ key });
        if (result.affected === 0) {
            throw new BadRequestException('No features found with the given key');
        }
    }
} 