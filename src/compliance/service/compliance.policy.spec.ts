import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { CompliancePolicy } from "./compliance.policy";

// jest.mock('src/application/applicationPolicy.service');

class MockApplicationPolicyService extends ApplicationPolicyService {
    constructor() {
        const mockAppUserRepo = {} as Repository<AppUser>;
        const mockUserRepo = {} as Repository<User>;
        const mockTaskRepo = {} as Repository<any>;
        super(mockAppUserRepo, mockUserRepo, mockTaskRepo);
    }

    protected async ensureAdminPrivileges(applicationId: number, userId: string): Promise<void> {
        return Promise.resolve();
    }

    protected async ensureNotHavePendingTask(applicationId: number): Promise<void> {
        return Promise.resolve();
    }
}

describe('CompliancePolicy', () => {
    let service: CompliancePolicy;
    let mockAppUserRepo: jest.Mocked<Repository<AppUser>>;
    let mockUserRepo: jest.Mocked<Repository<User>>;
    let mockTaskRepo: jest.Mocked<Repository<AsyncTask>>;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockAppUserRepo = {} as jest.Mocked<Repository<AppUser>>;
        mockUserRepo = {} as jest.Mocked<Repository<User>>;
        mockTaskRepo = {} as jest.Mocked<Repository<AsyncTask>>;

        service = new CompliancePolicy(mockAppUserRepo, mockUserRepo, mockTaskRepo);

        jest.spyOn(service as any, 'ensureAdminPrivileges')
            .mockImplementation(async () => Promise.resolve());

        jest.spyOn(service as any, 'ensureNotHavePendingTask')
            .mockImplementation(async () => Promise.resolve());
    });

    const testMethods = [
        'canGetComplianceControlDetails',
        'canGetControlEnhancements',
        'canGetControlAssets',
    ];

    const testWithUpdatemethods = [
        'canSetEvidence',
        'canSetEnhancementException',
        'canSyncCompliance',
        'canSetRiskLevel',
        'canSetRiskLevels',
    ]

    testMethods.forEach(methodName => {
        describe(`${methodName}`, () => {
            const userInfo = { userId: 'test-user-id' };
            const applicationId = 123;

            it('should call ensureAdminPrivileges with correct parameters', async () => {
                const ensureAdminPrivilegesSpy = jest.spyOn(
                    service as any,
                    'ensureAdminPrivileges'
                );

                await service[methodName](userInfo, applicationId);

                expect(ensureAdminPrivilegesSpy).toHaveBeenCalledWith(
                    applicationId,
                    userInfo.userId
                );
                expect(ensureAdminPrivilegesSpy).toHaveBeenCalledTimes(1);
            });

            it('should throw error when ensureAdminPrivileges fails', async () => {
                const error = new Error('Access denied');
                const ensureAdminPrivilegesSpy = jest.spyOn(
                    service as any,
                    'ensureAdminPrivileges'
                );
                ensureAdminPrivilegesSpy.mockRejectedValue(error);

                await expect(service[methodName](userInfo, applicationId))
                    .rejects
                    .toThrow(error);
            });
        });
    });

    testWithUpdatemethods.forEach(methodName => {
        describe(`${methodName}`, () => {
            const userInfo = { userId: 'test-user-id' };
            const applicationId = 123;

            it('should call ensureAdminPrivileges with correct parameters', async () => {
                const ensureAdminPrivilegesSpy = jest.spyOn(
                    service as any,
                    'ensureAdminPrivileges'
                );

                const ensureNotHavePendingTaskSpy = jest.spyOn(
                    service as any,
                    'ensureNotHavePendingTask'
                );

                await service[methodName](userInfo, applicationId);

                expect(ensureAdminPrivilegesSpy).toHaveBeenCalledWith(
                    applicationId,
                    userInfo.userId
                );
                expect(ensureNotHavePendingTaskSpy).toHaveBeenCalledWith(applicationId);
                expect(ensureAdminPrivilegesSpy).toHaveBeenCalledTimes(1);
                expect(ensureNotHavePendingTaskSpy).toHaveBeenCalledTimes(1);
            });

            it('should throw error when ensureAdminPrivileges fails', async () => {
                const error = new Error('Access denied');
                const ensureAdminPrivilegesSpy = jest.spyOn(
                    service as any,
                    'ensureAdminPrivileges'
                );
                ensureAdminPrivilegesSpy.mockRejectedValue(error);

                await expect(service[methodName](userInfo, applicationId))
                    .rejects
                    .toThrow(error);
            });

            it('should throw error when ensureNotHavePendingTask fails', async () => {
                const error = new Error('Pending task exists');
                jest.spyOn(
                    service as any,
                    'ensureAdminPrivileges'
                );

                jest.spyOn(
                    service as any,
                    'ensureNotHavePendingTask'
                ).mockRejectedValue(error);

                await expect(service[methodName](userInfo, applicationId))
                    .rejects
                    .toThrow(error);
            });
        });
    });

    it('should extend ApplicationPolicyService', () => {
        expect(service).toBeInstanceOf(ApplicationPolicyService);
    });
});
