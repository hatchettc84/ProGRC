import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../entities/featureFlag.entity';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
  ) { }

  async create(createFeatureFlagDto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    const featureFlag = this.featureFlagRepository.create(createFeatureFlagDto);
    return this.featureFlagRepository.save(featureFlag);
  }

  async findAll(): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find();
  }

  async findOne(id: number): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagRepository.findOne({ where: { id } });
    if (!featureFlag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }
    return featureFlag;
  }

  async update(id: number, updateFeatureFlagDto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    const featureFlag = await this.findOne(id);
    Object.assign(featureFlag, updateFeatureFlagDto);
    return this.featureFlagRepository.save(featureFlag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.featureFlagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }
  }

  async isFeatureEnabled(featureName: string, entityId?: string): Promise<boolean> {
    const featureFlag = await this.featureFlagRepository.findOne({ where: { name: featureName } });

    if (!featureFlag) {
      return false;
    }

    if (featureFlag.isGloballyEnabled) {
      return entityId ? !featureFlag.blacklist.includes(entityId) : true;
    }

    return featureFlag.isEnabled && (entityId ? featureFlag.whitelist.includes(entityId) : false);
  }

  async findByName(name: string): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagRepository.findOne({ where: { name } });
    if (!featureFlag) {
      throw new NotFoundException(`Feature flag with name ${name} not found`);
    }
    return featureFlag;
  }
}
