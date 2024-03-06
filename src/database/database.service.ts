import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  private persistence = {};

  findById(id: string) {
    return this.persistence[id];
  }

  setById(id: string, data: any) {
    this.persistence[id] = data;
  }
}
