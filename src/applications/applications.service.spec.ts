import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationEntity } from './entities/application.entity';
import { QueueService } from '../queue/queue.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockQueueService = { addNotificationJob: jest.fn() };
  const mockRepo = { create: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: QueueService, useValue: mockQueueService },
        { provide: getRepositoryToken(ApplicationEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should create application and add notification job', async () => {
    const dto = { name: 'John', email: 'john@example.com', message: 'Hello' };
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue({ id: '1', ...dto });

    const result = await service.createApplication(dto);
    expect(result.id).toBe('1');
    expect(mockQueueService.addNotificationJob).toHaveBeenCalledWith(
      expect.objectContaining(dto),
    );
  });

  it('should throw an error when save fails', async () => {
    const dto = { name: 'John', email: 'john@example.com', message: 'Hello' };
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockRejectedValue(new Error('Database error'));

    await expect(service.createApplication(dto)).rejects.toThrow(
      'Database error',
    );
  });
});
