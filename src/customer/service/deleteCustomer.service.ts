import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { Customer } from "src/entities/customer.entity";
import { User } from "src/entities/user.entity";
import { DeleteUserService } from "src/user/services/deleteUser.service";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class DeleteCustomerService {
    constructor(
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly cognitoService: CognitoService,
        private readonly dataSource: DataSource,
        private readonly deleteUserService: DeleteUserService,
    ) { }

    async deleteCustomer(id: string): Promise<void> {
        const tenant: Customer = await this.customerRepo.findOneOrFail({ where: { id } });

        const users: User[] = await this.userRepo.find({
            where: { customer_id: tenant.id },
        });

        await this.dataSource.transaction(async manager => {
            const deletionPromises = [];

            for (const user of users) {
                deletionPromises.push(this.deleteUserService.deleteUserWithOrg(tenant.id, user.id));
            }

            await Promise.all(deletionPromises);
            await manager.delete(Customer, { id });
        });
    }

    async deleteCustomerMember(customerId: string, userId: string): Promise<void> {
        await this.dataSource.transaction(async manager => {
            const result = await manager.delete(User, { id: userId, customer_id: customerId });

            if (result.affected === 0) {
                throw new BadRequestException('User not found');
            }
        });
    }

    async deleteCustomerMemberFromCurrentCustomer(userInfo: { customerId: string }, memberId: string): Promise<void> {
        await this.deleteCustomerMember(userInfo.customerId, memberId);
    }
}
