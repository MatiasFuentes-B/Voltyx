import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresController } from './proveedores.controller.js';

describe('ProveedoresController', () => {
  let controller: ProveedoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedoresController],
    }).compile();

    controller = module.get<ProveedoresController>(ProveedoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
