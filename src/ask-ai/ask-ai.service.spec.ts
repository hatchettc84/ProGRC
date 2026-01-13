import { Test, TestingModule } from '@nestjs/testing';
import { AskAiService } from './ask-ai.service';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import OpenAIApi from 'openai';

jest.mock('openai');

describe('AskAiService', () => {
  let service: AskAiService;
  let customerRepo: Repository<Customer>;
  let openaiMock: jest.Mocked<OpenAIApi>;

  const mockCustomerRepo = {
    count: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake-openai-api-key'),
  };

  beforeEach(async () => {
    openaiMock = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AskAiService,
        { provide: getRepositoryToken(Customer), useValue: mockCustomerRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(AssessmentDetail), useValue: {} },
        { provide: getRepositoryToken(AssessmentOutline), useValue: {} },
        { provide: getRepositoryToken(AssessmentHistory), useValue: {} },
        { provide: getRepositoryToken(AssessmentSections), useValue: {} },
        { provide: getRepositoryToken(AssessmentSectionsHistory), useValue: {} },
      ],
    }).compile();

    service = module.get<AskAiService>(AskAiService);
    customerRepo = module.get<Repository<Customer>>(getRepositoryToken(Customer));

    // Inject mocked OpenAIApi instance
    (service as any).openai = openaiMock;
  });

  describe('submitQuery', () => {
    it('should throw ForbiddenException if organization does not exist', async () => {
      mockCustomerRepo.count.mockResolvedValue(0);

      const userInfo = { tenant_id: 1, userId: 123 };
      const data = { assessment_id: 1, query_text: 'test' };

      await expect(service.submitQuery(userInfo, data)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if userId is missing', async () => {
      mockCustomerRepo.count.mockResolvedValue(1);

      const userInfo = { tenant_id: 1, userId: null };
      const data = { assessment_id: 1, query_text: 'test' };

      await expect(service.submitQuery(userInfo, data)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return a valid response if all checks pass', async () => {
      mockCustomerRepo.count.mockResolvedValue(1);

      const userInfo = { tenant_id: 1, userId: 123 };
      const data = {
        assessment_id: 1,
        query_text: 'test',
        section_text: 'some text',
        section_id: 'section123',
      };

      const result = await service.submitQuery(userInfo, data);

      expect(result).toHaveProperty('id');
      expect(result).toMatchObject({
        assessment_id: 1,
        section_id: 'section123',
        query_text: 'test',
        content: 'some text',
        description: 'Please find the result below:',
      });
    });
  });

});
