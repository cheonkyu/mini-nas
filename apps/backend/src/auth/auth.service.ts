import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { db } from '../db';
import { users, tokenBlacklist } from '../db/schema';
import { TokenPayload } from '@mini-nas/shared-types';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Account lock check
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new ForbiddenException(
        'Account is locked. Please try again later.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await this.handleFailedAttempt(user.id);
      throw new UnauthorizedException('Invalid username or password');
    }

    // Reset failed attempts on success
    await db
      .update(users)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(users.id, user.id));

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = this.jwtService.sign(payload);
    const expiresAt = new Date(payload.exp * 1000);

    return { token, expiresAt };
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token) as TokenPayload;
    if (decoded) {
      await db.insert(tokenBlacklist).values({
        jti: token, // Using token as JTI for simplicity
        expiresAt: new Date(decoded.exp * 1000),
      });
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    const isBlacklisted = await db
      .select()
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.jti, token))
      .limit(1);
    if (isBlacklisted.length > 0) {
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      return this.jwtService.verify(token) as TokenPayload;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(token: string) {
    const payload = await this.validateToken(token);
    const newPayload: TokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };
    const newToken = this.jwtService.sign(newPayload);
    return { token: newToken, expiresAt: new Date(newPayload.exp * 1000) };
  }

  private async handleFailedAttempt(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const newAttempts = user.failedAttempts + 1;
    const lockData: any = { failedAttempts: newAttempts };

    if (newAttempts >= 5) {
      lockData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await db.update(users).set(lockData).where(eq(users.id, userId));
  }

  async createUser(username: string, password: string) {
    const hash = await bcrypt.hash(password, this.saltRounds);
    await db.insert(users).values({
      username,
      passwordHash: hash,
    });
  }
}
