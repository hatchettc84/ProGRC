import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from 'src/entities/sector.entity';

@Injectable()
export class SectorService {
    constructor(
        @InjectRepository(Sector)
        private readonly sectorRepository: Repository<Sector>,
    ) {}

    async findAll(): Promise<Sector[]> {
        return this.sectorRepository.find({
            order: {
                name: 'ASC'
            }
        });
    }
} 