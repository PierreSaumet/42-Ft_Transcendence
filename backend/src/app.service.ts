import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World and Ming and Lucien and Jules and Reda and Pierre!';
  }
}
