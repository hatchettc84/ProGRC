import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrustCenter, TrustCenterStatus } from 'src/entities/trustCenter.entity';
import { Repository } from 'typeorm';
import { GetTrustCenterService } from './getTrustCenter.service';

describe('GetTrustCenterService', () => {
    let service: GetTrustCenterService;
    let trustCenterRepository: jest.Mocked<Repository<TrustCenter>>;

    beforeEach(async () => {
        const mockTrustCenterRepository = {
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetTrustCenterService,
                {
                    provide: getRepositoryToken(TrustCenter),
                    useValue: mockTrustCenterRepository,
                },
            ],
        }).compile();

        service = module.get<GetTrustCenterService>(GetTrustCenterService);
        trustCenterRepository = module.get(getRepositoryToken(TrustCenter));
    });

    describe('getForApp', () => {
        it('should return a list of TrustCenter entities', async () => {
            const userInfo = { customerId: 'customer123' };
            const appId = 1;

            const mockTrustCenters: TrustCenter[] = [
                {
                    id: 1,
                    app_id: appId,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                    updated_by_user: {},
                } as TrustCenter,
            ];

            trustCenterRepository.find.mockResolvedValue(mockTrustCenters);

            const result = await service.getForApp(userInfo, appId);

            expect(trustCenterRepository.find).toHaveBeenCalledWith({
                where: {
                    app_id: appId,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                },
                relations: ['updated_by_user'],
            });
            expect(result).toEqual(mockTrustCenters);
        });

        it('should return an empty array if no TrustCenters match the query', async () => {
            const userInfo = { customerId: 'customer123' };
            const appId = 2;

            trustCenterRepository.find.mockResolvedValue([]);

            const result = await service.getForApp(userInfo, appId);

            expect(trustCenterRepository.find).toHaveBeenCalledWith({
                where: {
                    app_id: appId,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                },
                relations: ['updated_by_user'],
            });
            expect(result).toEqual([]);
        });
    });
});
