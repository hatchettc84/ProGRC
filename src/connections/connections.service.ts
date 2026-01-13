import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, LessThan, Repository } from "typeorm";
import { CreateConnectionDto } from "./dto/create-connection.dto";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { UpdateConnectionDto } from "./dto/update-connection.dto";
import { LoggerService } from "src/logger/logger.service";
import { Lock } from "src/entities/lock.entity";
@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(ApplicationConnection)
    private readonly applicationConnectionRepo: Repository<ApplicationConnection>,
    @InjectRepository(Lock)
    private readonly lockRepo: Repository<Lock>,
    private readonly logger: LoggerService
  ) {}

  async getConnections(applicationId: number) {
    return this.applicationConnectionRepo.find({
      where: {
        application_id: applicationId,
      },
    });
  }

  async getPendingConnnections() {
    const last24HoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
    return this.applicationConnectionRepo.find({
      where: [
        { last_synced_at: LessThan(last24HoursAgo) },
        { last_synced_at: IsNull() },
      ],
    });
  }

  async updateConnection(id: number, body: UpdateConnectionDto) {
    await this.applicationConnectionRepo.update(id, body);
    const updatedConnection = await this.applicationConnectionRepo.findOne({
      where: {
        id,
      },
    });
    return updatedConnection;
  }

  async createConnection(body: CreateConnectionDto) {
    const existingConnection = await this.applicationConnectionRepo
      .createQueryBuilder("application_connection")
      .where("metadata ::jsonb @> :metadata", {
        metadata: {
          role_arn: body.metadata.role_arn,
        },
      })
      .andWhere("application_id = :applicationId", {
        applicationId: body.applicationId,
      })
      .getOne();

    if (existingConnection) {
      throw new BadRequestException("Connection already exists");
    }

    const data: any = {
      application_id: body.applicationId,
      source_type: body.sourceTypeId,
      metadata: body.metadata,
    };
    return this.applicationConnectionRepo.save(data);
  }

  async deleteConnection(id: number) {
    await this.applicationConnectionRepo.delete(id);
    return { message: "Connection deleted successfully" };
  }

  async acquireLock(lockName: string): Promise<boolean> {
    try {
      const existingLock = await this.lockRepo.findOne({
        where: { name: lockName },
      });

      if (existingLock) {
        if (existingLock.acquiredAt > new Date(Date.now() - 10 * 60 * 1000)) {
          return false;
        }
        await this.lockRepo.delete({ name: lockName });
      }

      const lock = this.lockRepo.create({
        name: lockName,
      });

      await this.lockRepo.save(lock);
      return true;
    } catch (error) {
      this.logger.error("Error acquiring lock:", error);
      return false;
    }
  }

  async releaseLock(lockName: string): Promise<void> {
    try {
      await this.lockRepo.delete({ name: lockName });
    } catch (error) {
      this.logger.error("Error releasing lock:", error);
      throw error;
    }
  }
}
