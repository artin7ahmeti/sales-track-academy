import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { Role, type TokenPayload } from '@salestrack/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: { id: string; email: string; role: string }) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens
    return this.login(storedToken.user);
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for the user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async signup(email: string, name: string, password: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { name, passwordHash, isActive: true, role: 'AGENT' as Role, deletedAt: null },
        })
      : await this.prisma.user.create({
          data: { email, name, passwordHash, role: 'AGENT' as Role, isActive: true },
        });

    return this.login(user);
  }

  async acceptInvite(token: string, name: string, password: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation has already been used or expired');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser && existingUser.isActive) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: { name, passwordHash, isActive: true, role: invitation.role as Role },
          })
        : await tx.user.create({
            data: {
              email: invitation.email,
              name,
              passwordHash,
              role: invitation.role as Role,
              isActive: true,
            },
          });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', userId: newUser.id },
      });

      return newUser;
    });

    return { message: 'Account activated successfully', userId: user.id };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const expiresAt = new Date();

    // Parse duration string like "7d", "24h", "30m"
    const match = expiresIn.match(/^(\d+)([dhm])$/);
    if (match) {
      const value = parseInt(match[1]!, 10);
      const unit = match[2];
      if (unit === 'd') expiresAt.setDate(expiresAt.getDate() + value);
      else if (unit === 'h') expiresAt.setHours(expiresAt.getHours() + value);
      else if (unit === 'm') expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
    }

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }
}
