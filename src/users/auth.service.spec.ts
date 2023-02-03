import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    mockUserService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('orero@gmail.com', 'password');

    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should throw an error if email already exists', async () => {
    mockUserService.find = () =>
      Promise.resolve([
        { id: 1, email: 'email', password: 'password' } as User,
      ]);
    await expect(service.signup('orero@gmail.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('AuthService - Login', () => {
  let service: AuthService;
  let mockUserService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    mockUserService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should throw an error if email does not exist', async () => {
    await expect(service.signin('orero@gmail.com', 'password')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw an error if an invalid password is provided', async () => {
    mockUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'email', password: 'oijdsd' } as User]);
    await expect(service.signup('orero@gmail.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return a user if valid password is provided', async () => {
    mockUserService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'email',
          password:
            '06e874434bb6da73.1c6cef22eb077b64cca6672f618b09568166add73d313923ad44ee873faddec5',
        } as User,
      ]);
    const user = await service.signin('orero@gmail.com', 'password');
    expect(user).toBeDefined;
  });
});
