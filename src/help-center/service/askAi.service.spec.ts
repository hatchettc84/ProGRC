import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AskAiService } from './askAi.service';

const mockOpenAIInstance = {
    chat: {
        completions: {
            create: jest.fn()
        }
    }
};

jest.mock('openai', () => {
    return {
        default: jest.fn().mockImplementation(() => mockOpenAIInstance)
    };
});

describe('AskAiService', () => {
    let service: AskAiService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AskAiService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AskAiService>(AskAiService);
        configService = module.get<ConfigService>(ConfigService);

        jest.clearAllMocks();
    });

    it('should return a message when AI is disabled', async () => {
        jest.spyOn(configService, 'get').mockImplementation((key: string) => {
            if (key === 'OPENAI_HELP_CENTER_ENABLED') return 'false';
            if (key === 'OPENAI_API_KEY') return 'test-key';
            return null;
        });

        const result = await service.question('What is AI?');
        expect(result).toBe('Sorry, I am not available right now. Please try again later.');
    });

    it('should return AI response when AI is enabled', async () => {
        jest.spyOn(configService, 'get').mockImplementation((key: string) => {
            if (key === 'OPENAI_HELP_CENTER_ENABLED') return 'true';
            if (key === 'OPENAI_HELP_CENTER_MODEL') return 'gpt-4';
            if (key === 'OPENAI_API_KEY') return 'test-key';
            return null;
        });

        const mockCompletion = {
            choices: [
                {
                    message: {
                        content: 'AI is the simulation of human intelligence in machines.',
                    },
                },
            ],
        };

        const mockCreate = jest.fn().mockResolvedValue(mockCompletion);
        (service['openaiClient'].chat.completions.create as jest.Mock) = mockCreate;

        const result = await service.question('What is AI?');
        expect(result).toBe('AI is the simulation of human intelligence in machines.');
        expect(mockCreate).toHaveBeenCalled();
    });

    it('should throw BadRequestException when OpenAI API fails', async () => {
        jest.spyOn(configService, 'get').mockImplementation((key: string) => {
            if (key === 'OPENAI_HELP_CENTER_ENABLED') return 'true';
            if (key === 'OPENAI_HELP_CENTER_MODEL') return 'gpt-4';
            if (key === 'OPENAI_API_KEY') return 'test-key';
            return null;
        });

        const mockCreate = jest.fn().mockRejectedValue(new Error('OpenAI API error'));
        (service['openaiClient'].chat.completions.create as jest.Mock) = mockCreate;

        await expect(service.question('What is AI?')).rejects.toThrow(BadRequestException);
        expect(mockCreate).toHaveBeenCalled();
    });
});
