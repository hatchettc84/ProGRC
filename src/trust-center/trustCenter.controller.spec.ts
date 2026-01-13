import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { AuthGuard } from 'src/guards/authGuard';
import { DeleteTrustCenterService } from './service/deleteTrustCenter.service';
import { GetTrustCenterService } from './service/getTrustCenter.service';
import { UpdateTrustCenterService } from './service/updateTrustCenter.service';
import { TrustCenterController } from './trustCenter.controller';
import { UpdateTrustCenterRequest } from './trustCenter.dto';

class MockTrustCenter {
    id: number;
    name: string;
    approval_date: Date;
    submission_date: Date;
    file_path: string;
    updated_at: Date;
    updated_by_user: {
        id: string;
        name: string;
    };
}

describe('TrustCenterController', () => {
    let controller: TrustCenterController;
    let getTrustCenterService: jest.Mocked<GetTrustCenterService>;
    let updateTrustCenterService: jest.Mocked<UpdateTrustCenterService>;
    let deleteTrustCenterService: jest.Mocked<DeleteTrustCenterService>;

    const mockGetTrustCenterService = {
        getForApp: jest.fn(),
    };

    const mockUpdateTrustCenterService = {
        updateTrustCenter: jest.fn(),
    }

    const mockDeleteTrustCenterService = {
        delete: jest.fn(),
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TrustCenterController],
            providers: [
                {
                    provide: GetTrustCenterService,
                    useValue: mockGetTrustCenterService,
                },
                {
                    provide: UpdateTrustCenterService,
                    useValue: mockUpdateTrustCenterService,
                },
                {
                    provide: DeleteTrustCenterService,
                    useValue: mockDeleteTrustCenterService,
                },
                {
                    provide: AuthService,
                    useValue: {},
                },
                {
                    provide: AuthGuard,
                    useValue: {},
                },
                {
                    provide: RoleHierarchyService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<TrustCenterController>(TrustCenterController);
        getTrustCenterService = module.get(GetTrustCenterService);
        updateTrustCenterService = module.get(UpdateTrustCenterService);
        deleteTrustCenterService = module.get(DeleteTrustCenterService);
    });

    describe('getTrustCenters', () => {
        it('should throw BadRequestException when appId is not provided', async () => {
            await expect(controller.getTrustCenters({ user_data: {} }, null)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should return trust centers for an app', async () => {
            const mockTrustCenter = new MockTrustCenter();
            mockTrustCenter.id = 1;
            mockTrustCenter.name = 'Test Trust Center';
            mockTrustCenter.approval_date = new Date();
            mockTrustCenter.submission_date = new Date();
            mockTrustCenter.file_path = 'test.pdf';
            mockTrustCenter.updated_at = new Date();
            mockTrustCenter.updated_by_user = {
                id: 'test-uuid',
                name: 'Test User',
            };

            mockGetTrustCenterService.getForApp.mockResolvedValue([mockTrustCenter]);

            const result = await controller.getTrustCenters({ user_data: {} }, 1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: mockTrustCenter.id,
                name: mockTrustCenter.name,
                approval_date: mockTrustCenter.approval_date,
                submission_date: mockTrustCenter.submission_date,
                file_path: mockTrustCenter.file_path,
                updated_at: mockTrustCenter.updated_at,
                updated_by: {
                    id: mockTrustCenter.updated_by_user.id,
                    name: mockTrustCenter.updated_by_user.name,
                },
            });
            expect(getTrustCenterService.getForApp).toHaveBeenCalledWith({}, 1);
        });
    });

    describe('updateTrustCenter', () => {
        it('should throw BadRequestException when body not valid', async () => {
            const body = new UpdateTrustCenterRequest();
            await expect(controller.updateTrustCenter({ user_data: {} }, 1, body)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should update trust center', async () => {
            const body = new UpdateTrustCenterRequest();
            body.name = 'Updated Trust Center';
            body.approvalDate = new Date();
            body.submissionDate = new Date();

            await controller.updateTrustCenter({ user_data: {} }, 1, body);

            expect(updateTrustCenterService.updateTrustCenter).toHaveBeenCalledWith({}, 1, body);
        });
    });

    describe('deleteTrustCenter', () => {
        it('should delete trust center', async () => {
            await controller.deleteTrustCenter({ user_data: {} }, 1);

            expect(deleteTrustCenterService.delete).toHaveBeenCalledWith({}, 1);
        });
    });
});
