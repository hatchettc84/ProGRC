import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { Repository } from "typeorm";
import { DeleteTrustCenterService } from "./deleteTrustCenter.service"; // Adjust path as needed

describe("DeleteTrustCenterService", () => {
    let service: DeleteTrustCenterService;
    let trustCenterRepository: jest.Mocked<Repository<TrustCenter>>;

    const mockTrustCenterRepository = {
        findOneOrFail: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteTrustCenterService,
                {
                    provide: getRepositoryToken(TrustCenter),
                    useValue: mockTrustCenterRepository,
                },
            ],
        }).compile();

        service = module.get<DeleteTrustCenterService>(DeleteTrustCenterService);
        trustCenterRepository = module.get(getRepositoryToken(TrustCenter));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("delete", () => {
        it("should call findOneOrFail and delete the trust center when it exists", async () => {
            const userInfo = { userId: "user123", customerId: "customer123" };
            const id = 1;

            const mockTrustCenter = {
                id: 1,
                customer_id: "customer123",
            } as TrustCenter;

            trustCenterRepository.findOneOrFail.mockResolvedValue(mockTrustCenter);

            await service.delete(userInfo, id);

            expect(trustCenterRepository.findOneOrFail).toHaveBeenCalledWith({
                where: { id, customer_id: userInfo.customerId },
            });

            expect(trustCenterRepository.delete).toHaveBeenCalledWith(mockTrustCenter.id);
        });

        it("should throw an error if the trust center does not exist", async () => {
            const userInfo = { userId: "user123", customerId: "customer123" };
            const id = 1;

            trustCenterRepository.findOneOrFail.mockRejectedValue(new Error("Trust center not found"));

            await expect(service.delete(userInfo, id)).rejects.toThrow("Trust center not found");

            expect(trustCenterRepository.findOneOrFail).toHaveBeenCalledWith({
                where: { id, customer_id: userInfo.customerId },
            });

            expect(trustCenterRepository.delete).not.toHaveBeenCalled();
        });
    });
});
