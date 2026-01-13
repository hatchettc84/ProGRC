import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TrustCenter, TrustCenterStatus } from "src/entities/trustCenter.entity";
import { Repository } from "typeorm";
import { UpdateTrustCenterService } from "./updateTrustCenter.service"; // Adjust path as needed

describe("UpdateTrustCenterService", () => {
    let service: UpdateTrustCenterService;
    let trustCenterRepository: jest.Mocked<Repository<TrustCenter>>;

    const mockTrustCenterRepository = {
        findOneOrFail: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateTrustCenterService,
                {
                    provide: getRepositoryToken(TrustCenter),
                    useValue: mockTrustCenterRepository,
                },
            ],
        }).compile();

        service = module.get<UpdateTrustCenterService>(UpdateTrustCenterService);
        trustCenterRepository = module.get(getRepositoryToken(TrustCenter));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("updateTrustCenter", () => {
        it("should successfully update the TrustCenter when valid data is provided", async () => {
            const userInfo = { userId: "user123", customerId: "customer123" };
            const id = 1;
            const data = {
                name: "Updated Name",
                approvalDate: new Date(),
                submissionDate: new Date(),
            };

            trustCenterRepository.findOneOrFail.mockResolvedValue({
                id,
            } as TrustCenter);

            await expect(service.updateTrustCenter(userInfo, id, data)).resolves.not.toThrow();

            expect(trustCenterRepository.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    id,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                },
                select: ["id"],
            });

            expect(trustCenterRepository.update).toHaveBeenCalledWith(id, {
                name: data.name,
                approval_date: data.approvalDate,
                submission_date: data.submissionDate,
                updated_at: expect.any(Date),
                updated_by: userInfo.userId,
            });
        });

        it("should throw an error if the TrustCenter does not exist or status is not DONE", async () => {
            const userInfo = { userId: "user123", customerId: "customer123" };
            const id = 1;
            const data = { name: "Invalid Update" };

            trustCenterRepository.findOneOrFail.mockRejectedValue(
                new Error("TrustCenter not found")
            );

            await expect(service.updateTrustCenter(userInfo, id, data)).rejects.toThrow(
                "TrustCenter not found"
            );

            expect(trustCenterRepository.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    id,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                },
                select: ["id"],
            });

            expect(trustCenterRepository.update).not.toHaveBeenCalled();
        });

        it("should only update provided fields", async () => {
            const userInfo = { userId: "user123", customerId: "customer123" };
            const id = 2;
            const data = { name: "Updated Name" };

            trustCenterRepository.findOneOrFail.mockResolvedValue({
                id,
            } as TrustCenter);

            await expect(service.updateTrustCenter(userInfo, id, data)).resolves.not.toThrow();

            expect(trustCenterRepository.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    id,
                    customer_id: userInfo.customerId,
                    status: TrustCenterStatus.SUCCESS,
                },
                select: ["id"],
            });

            expect(trustCenterRepository.update).toHaveBeenCalledWith(id, {
                name: data.name,
                updated_at: expect.any(Date),
                updated_by: userInfo.userId,
            });
        });
    });
});
