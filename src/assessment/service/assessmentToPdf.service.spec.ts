import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import puppeteer from 'puppeteer';
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { Repository } from "typeorm";
import { AssessmentToPDF } from "./assessmentToPdf.service";

jest.mock('puppeteer', () => {
    return {
        __esModule: true,
        default: {
            launch: jest.fn().mockResolvedValue({
                newPage: jest.fn().mockResolvedValue({
                    setContent: jest.fn().mockResolvedValue(undefined),
                    pdf: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
                }),
                close: jest.fn().mockResolvedValue(undefined),
            }),
        },
    };
})

describe('AssessmentToPdf', () => {
    let service: AssessmentToPDF;
    let assessmentSectionRepo: jest.Mocked<Repository<AssessmentSections>>;
    let assessmentOutlineRepo: jest.Mocked<Repository<AssessmentOutline>>;
    let assessmentHistoryRepo: jest.Mocked<Repository<AssessmentHistory>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssessmentToPDF,
                {
                    provide: getRepositoryToken(AssessmentSections),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        query: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(AssessmentOutline),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(AssessmentHistory),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
            ]
        }).compile();

        service = module.get<AssessmentToPDF>(AssessmentToPDF);
        assessmentSectionRepo = module.get(getRepositoryToken(AssessmentSections));
        assessmentOutlineRepo = module.get(getRepositoryToken(AssessmentOutline));
        assessmentHistoryRepo = module.get(getRepositoryToken(AssessmentHistory));
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    describe('generatePDF', () => {
        it('should throw an error if assessment outline is not found', async () => {
            const assessmentId = 1;
            const appId = 1;
            const outlineVersion = 1;

            assessmentOutlineRepo.findOneOrFail.mockRejectedValueOnce(new Error('Assessment outline not found'));

            await expect(service.generatePDF(assessmentId, appId, outlineVersion)).rejects.toThrow('Assessment outline not found');
        });

        it('should throw error if assessment history not found', async () => {
            const assessmentId = 1;
            const appId = 1;
            const outlineVersion = 1;

            assessmentOutlineRepo.findOneOrFail.mockResolvedValueOnce({
                version: 2,
            } as AssessmentOutline);
            assessmentHistoryRepo.findOneOrFail.mockRejectedValueOnce(new Error('Assessment history not found'));

            await expect(service.generatePDF(assessmentId, appId, outlineVersion)).rejects.toThrow('Assessment history not found');
        });

        it('should return byte file when successfully generate pdf', async () => {
            const mockOutline = {
                version: 1,
                created_on: new Date(),
                outline: [
                    {
                        section_id: 'uuid1',
                        version: 0,
                        children: [
                            {
                                section_id: 'uuid2',
                                version: 0,
                                children: [],
                            }
                        ]
                    }
                ]
            };

            const mockSection = {
                section_id: '1',
                version: 1,
                content: { htmlContent: '<p>Section Content</p>' },
            };

            jest.spyOn(assessmentOutlineRepo, 'findOneOrFail').mockResolvedValue(mockOutline as any);
            jest.spyOn(assessmentSectionRepo, 'query').mockResolvedValue([
                { content: JSON.stringify(mockSection.content) },
            ]);

            const result = await service.generatePDF(1, 1, 1);

            expect(result).toBeInstanceOf(Uint8Array);
            expect(result).toEqual(new Uint8Array([1, 2, 3]));
            expect(puppeteer.launch).toHaveBeenCalled();
        })
    });
});
