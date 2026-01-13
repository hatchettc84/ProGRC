import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteApplicationService } from "src/application/deleteApplication.service";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { App } from "src/entities/app.entity";
import { AppUser } from "src/entities/appUser.entity";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { User } from "src/entities/user.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { DataSource, In, Repository } from "typeorm";

@Injectable()
export class DeleteUserService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly cognitoService: CognitoService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(App) private readonly appRepo: Repository<App>,
        private readonly deleteAppService: DeleteApplicationService,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepo: Repository<CustomerCsm>,
        @InjectRepository(AppUser) private readonly appUser: Repository<AppUser>,
        


    ) { }
    async deleteUser(id: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const user: User = await manager.findOneOrFail(User, { where: { id, role_id: In(UserRoles.getInternalRoles(), ) } });
            await this.validateUserRole(manager, user);

            await manager.delete(User, { id });
        });
    }

    private async validateUserRole(manager: any, user: User): Promise<void> {
        if (user.role_id === UserRole.CSM) {
            const totalAssignedToCustomer: number = await manager.count(CustomerCsm, { where: { user_id: user.id, role_id: UserRole.CSM } });
            if (totalAssignedToCustomer > 0) {
                throw new BadRequestException('User CSM still assigned to customer');
            }
        }
    }

    async deleteUserWithOrg(id: string, user_id: string): Promise<void> {
        try {
            const tenant: Customer = await this.customerRepo.findOneOrFail({ where: { id } });

            const users: User[] = await this.userRepo.find({
                where: { customer_id: tenant.id },
            });

            const appIds = await this.appRepo.find({ where: { customer_id: tenant.id } });
            await this.dataSource.transaction(async (manager) => {
                const deletionPromises = [];
                
                // Add application deletion promises
                for (const appId of appIds) {
                    deletionPromises.push(
                        this.deleteAppService.deleteApplication({ userId: user_id, tenantId: id }, appId.id)
                    );
                }

                // Add user deletion promise
                deletionPromises.push(manager.delete(User, { customer_id: id }));

                // Wait for all deletions to complete
                await Promise.all(deletionPromises);
            });
        } catch (error) {
            if (error.name === 'EntityNotFoundError') {
                throw new NotFoundException(`Customer with ID ${id} not found`);
            }
            throw error;
        }
    }

    async deleteAuditor(id: string): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id, role_id: UserRole.AUDITOR} });
        if (!user) {
            throw new NotFoundException(`Auditor with ID ${id} not found.`);
        }

        await this.dataSource.transaction(async (manager) => {
            await this.appUser.delete({ user_id: id });
            await this.customerCsmRepo.delete({ user_id: id
            });
            await manager.delete(User, { id });
        });
    
    }


}
