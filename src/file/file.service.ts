import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';

@Injectable()
export class FileService {
  async readFile(fileName: string): Promise<string | null> {
    try {
      const content = await fsPromises.readFile(fileName, 'utf8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Error readFile API: ${error.message}`);;
    }
  }

  async writeFile(fileName: string, content: string): Promise<void> {
    await fsPromises.writeFile(fileName, content);
  }

  async createOrReadFile(
    fileName: string,
    content: string,
  ): Promise<string | null> {
    const existingContent = await this.readFile(fileName);
    if (existingContent !== null) {
      return existingContent;
    } else {
      await this.writeFile(fileName, content);
      return content;
    }
  }
}
