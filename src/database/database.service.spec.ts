import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and retrieve data by id', () => {
    const id = 'exampleId';
    const data = { name: 'John Doe', age: 30 };

    service.setById(id, data);
    const retrievedData = service.findById(id);

    expect(retrievedData).toEqual(data);
  });

  it('should return undefined for non-existing id', () => {
    const nonExistingId = 'nonExistingId';

    const retrievedData = service.findById(nonExistingId);
    expect(retrievedData).toBeUndefined();
  });
});

