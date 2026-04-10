import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jwtService.sign = jest.fn().mockReturnValue('mock-jwt-token');
    jwtService.verify = jest
      .fn()
      .mockReturnValue({ userId: '1', username: 'testuser' });
    jwtService.decode = jest
      .fn()
      .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
  });

  it('should create a user and login successfully', async () => {
    const username = 'testuser' + Math.random();
    const password = 'password123';

    await service.createUser(username, password);
    const result = await service.login(username, password);

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('expiresAt');
  });

  it('should fail login with wrong password', async () => {
    const username = 'wronguser' + Math.random();
    const password = 'password123';

    await service.createUser(username, password);

    await expect(service.login(username, 'incorrect')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should lock account after 5 failed attempts', async () => {
    const username = 'lockuser' + Math.random();
    const password = 'password123';
    await service.createUser(username, password);

    for (let i = 0; i < 5; i++) {
      try {
        await service.login(username, 'wrong');
      } catch (e) {}
    }

    await expect(service.login(username, password)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
