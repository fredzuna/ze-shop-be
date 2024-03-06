import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { promises as fsPromises } from 'fs';
import { AxiosError } from 'axios';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('FileService', () => {
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    fileService = module.get<FileService>(FileService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // This ensures that mocks are cleared after each test
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const fileName = 'test.txt';
      const fileContent = 'Hello, World!';
      (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(fileContent);

      const result = await fileService.readFile(fileName);

      expect(result).toEqual(fileContent);
      expect(fsPromises.readFile).toHaveBeenCalledWith(fileName, 'utf8');
    });

    it('should return null for non-existing file', async () => {
      const fileName = 'nonexistent.txt';
      (fsPromises.readFile as jest.Mock).mockRejectedValueOnce({
        code: 'ENOENT',
      });

      const result = await fileService.readFile(fileName);

      expect(result).toBeNull();
      expect(fsPromises.readFile).toHaveBeenCalledWith(fileName, 'utf8');
    });

    it('should throw an error for other errors', async () => {
      const fileName = 'error.txt';
      const errorMessage = 'Some error message';
      (fsPromises.readFile as jest.Mock).mockRejectedValueOnce({
        message: errorMessage,
      });

      await expect(fileService.readFile(fileName)).rejects.toThrow('Error readFile API');
      expect(fsPromises.readFile).toHaveBeenCalledWith(fileName, 'utf8');
    });
  });

  describe('writeFile', () => {
    it('should write file content', async () => {
      const fileName = 'test.txt';
      const fileContent = 'Hello, World!';

      await fileService.writeFile(fileName, fileContent);

      expect(fsPromises.writeFile).toHaveBeenCalledWith(fileName, fileContent);
    });
  });

  describe('createOrReadFile', () => {
    it('should return existing content', async () => {
      const fileName = 'existing.txt';
      const existingContent = 'Existing Content';
      (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(existingContent);

      const result = await fileService.createOrReadFile(fileName, 'New Content');

      expect(result).toEqual(existingContent);
      expect(fsPromises.readFile).toHaveBeenCalledWith(fileName, 'utf8');
      expect(fsPromises.writeFile).not.toHaveBeenCalled();
    });

    it('should create file and return content if not exists', async () => {
      const fileName = 'nonexistent.txt';
      const newContent = 'New Content';
      (fsPromises.readFile as jest.Mock).mockRejectedValueOnce({
        code: 'ENOENT',
      });

      const result = await fileService.createOrReadFile(fileName, newContent);

      expect(result).toEqual(newContent);
      expect(fsPromises.readFile).toHaveBeenCalledWith(fileName, 'utf8');
      expect(fsPromises.writeFile).toHaveBeenCalledWith(fileName, newContent);
    });
  });
});
