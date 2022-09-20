import { Test, TestingModule } from '@nestjs/testing';
import { AuthentificationService } from './authentification.service';

describe('AuthentificationService', () => {
  let service: AuthentificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthentificationService],
    }).compile();

    service = module.get<AuthentificationService>(AuthentificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
