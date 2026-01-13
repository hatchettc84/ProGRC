import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptVariableService } from './prompt-variable.service';
import { PromptTemplateVariable } from 'src/entities/promptTemplateVariable.entity';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { LoggerService } from 'src/logger/logger.service';
import { TemplateSectionType } from 'src/entities/templatesSection.entity';
import { CreatePromptVariableDto } from './dto/prompt-variable.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PromptVariableService', () => {
  let service: PromptVariableService;
  let repository: Repository<PromptTemplateVariable>;
  let askAiService: AskAiService;
  let loggerService: LoggerService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAskAiService = {
    processPromptVariable: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptVariableService,
        {
          provide: getRepositoryToken(PromptTemplateVariable),
          useValue: mockRepository,
        },
        {
          provide: AskAiService,
          useValue: mockAskAiService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<PromptVariableService>(PromptVariableService);
    repository = module.get<Repository<PromptTemplateVariable>>(getRepositoryToken(PromptTemplateVariable));
    askAiService = module.get<AskAiService>(AskAiService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPromptVariable', () => {
    it('should create a prompt variable successfully', async () => {
      const userInfo = { customerId: 'customer-123', sub: 'user-123' };
      const createDto: CreatePromptVariableDto = {
        display_name: 'Test Variable',
        prompt: 'Test prompt',
        context_source: 'customer.name',
        output_format: 'plain text',
        type: TemplateSectionType.GLOBAL,
        group_id: 1,
      };

      const mockVariable = {
        id: 1,
        variable_name: 'prompt_test_variable_abc123',
        display_name: 'Test Variable',
        ...createDto,
        customer_id: userInfo.customerId,
        created_by: userInfo.sub,
      };

      mockRepository.findOne.mockResolvedValue(null); // No existing variable
      mockRepository.create.mockReturnValue(mockVariable);
      mockRepository.save.mockResolvedValue(mockVariable);

      const result = await service.createPromptVariable(userInfo, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        display_name: createDto.display_name,
        prompt: createDto.prompt,
        customer_id: userInfo.customerId,
        created_by: userInfo.sub,
      }));
      expect(mockRepository.save).toHaveBeenCalledWith(mockVariable);
      expect(result).toEqual(mockVariable);
    });

    it('should throw BadRequestException if variable name already exists', async () => {
      const userInfo = { customerId: 'customer-123', sub: 'user-123' };
      const createDto: CreatePromptVariableDto = {
        display_name: 'Test Variable',
        prompt: 'Test prompt',
        context_source: 'customer.name',
        output_format: 'plain text',
        type: TemplateSectionType.GLOBAL,
        group_id: 1,
      };

      const existingVariable = { id: 1, variable_name: 'prompt_test_variable_abc123' };
      mockRepository.findOne.mockResolvedValue(existingVariable);

      await expect(service.createPromptVariable(userInfo, createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getVariableByName', () => {
    it('should return a variable by name', async () => {
      const variableName = 'prompt_test_variable_abc123';
      const mockVariable = {
        id: 1,
        variable_name: variableName,
        display_name: 'Test Variable',
        is_active: true,
      };

      mockRepository.findOne.mockResolvedValue(mockVariable);

      const result = await service.getVariableByName(variableName);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { variable_name: variableName, is_active: true },
        relations: ['group'],
      });
      expect(result).toEqual(mockVariable);
    });

    it('should return null if variable not found', async () => {
      const variableName = 'nonexistent_variable';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getVariableByName(variableName);

      expect(result).toBeNull();
    });
  });

  describe('deletePromptVariable', () => {
    it('should soft delete a variable', async () => {
      const variableId = 1;
      const mockVariable = {
        id: variableId,
        variable_name: 'prompt_test_variable_abc123',
        is_active: true,
      };

      mockRepository.findOne.mockResolvedValue(mockVariable);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.deletePromptVariable(variableId);

      expect(mockRepository.update).toHaveBeenCalledWith(variableId, { is_active: false });
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if variable not found', async () => {
      const variableId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePromptVariable(variableId)).rejects.toThrow(NotFoundException);
    });
  });

});