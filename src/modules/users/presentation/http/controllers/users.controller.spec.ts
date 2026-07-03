import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from 'src/modules/users/application/use-cases/create-user.use-case';
import { GetAllUsersUseCase } from 'src/modules/users/application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from 'src/modules/users/application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from 'src/modules/users/application/use-cases/update-user.use-case';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: GetUserByIdUseCase, useValue: { execute: jest.fn() } },
        { provide: GetAllUsersUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
