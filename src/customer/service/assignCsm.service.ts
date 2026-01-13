import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { User } from "src/entities/user.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { DataSource, In, Repository } from "typeorm";

@Injectable()
export class AssignCustomerManagerService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepo: Repository<CustomerCsm>,
        private readonly dataSource: DataSource,
    ) { }

    async assignCSMToCustomer(userInfo: { userId: string }, customerId: string, csmIds: string[]): Promise<void> {
        await this.checkValidCustomerManager(csmIds);

        await this.dataSource.transaction(async (manager) => {
            const customer = await manager.findOneOrFail(Customer, { where: { id: customerId } });

            const customerCsms = csmIds.map(csmId => {
                return {
                    customer_id: customer.id,
                    user_id: csmId,
                    created_by: userInfo.userId,
                    role_id : UserRole.CSM
                }
            });

            await manager.insert(CustomerCsm, customerCsms);
        });
    }

    async unassignCSMFromCustomer(userInfo: { userId: string }, customerId: string, csmIds: string[]): Promise<void> {
        const uniqueCsmIds: string[] = [...new Set(csmIds)];
        await Promise.all([
            this.checkCSMAssignedToCustomer(customerId, uniqueCsmIds),
            await this.checkCustomerAtLeastOneCSMAfterUnassign(customerId, uniqueCsmIds),
        ]);

        await this.dataSource.transaction(async (manager) => {
            await manager.delete(CustomerCsm, {
                customer_id: customerId,
                user_id: In(csmIds),
                role_id: UserRole.CSM,
            });
        });
    }

    private async checkValidCustomerManager(csmIds: string[]): Promise<void> {
        const uniqueCsmIds: string[] = [...new Set(csmIds)];

        const totalUser: number = await this.userRepo.count({
            where: {
                id: In(uniqueCsmIds),
                role_id: UserRole.CSM
            }
        })

        if (totalUser !== uniqueCsmIds.length) {
            throw new BadRequestException('Invalid CSM Ids');
        }
    }

    private async checkCSMAssignedToCustomer(customerId: string, csmIds: string[]): Promise<void> {
        const totalAssignedCsm: number = await this.customerCsmRepo.count({
            where: {
                customer_id: customerId,
                user_id: In(csmIds),
                role_id: UserRole.CSM
            }
        });

        if (totalAssignedCsm !== csmIds.length) {
            throw new BadRequestException('Invalid CSM Ids');
        }
    }

    private async checkCustomerAtLeastOneCSMAfterUnassign(customerId: string, csmIds: string[]): Promise<void> {
        const totalAssignedCsm: number = await this.customerCsmRepo.count({
            where: {
                customer_id: customerId,
                role_id: UserRole.CSM,
            }
        });

        if (totalAssignedCsm - csmIds.length <= 0) {
            throw new BadRequestException('At least one CSM should be assigned to customer');
        }
    }
} 
