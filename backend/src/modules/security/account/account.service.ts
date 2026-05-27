import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AccountSecurityService {
  constructor(private readonly prisma: PrismaService) {}

  async flagSuspiciousAccount(dto: {
    userId: string;
    reasons: string[];
    riskScore: number;
    flaggedBy?: string;
    notes?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.suspiciousAccount.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      return this.prisma.suspiciousAccount.update({
        where: { userId: dto.userId },
        data: {
          reasons: dto.reasons,
          riskScore: dto.riskScore,
          notes: dto.notes ?? undefined,
        },
      });
    }

    return this.prisma.suspiciousAccount.create({
      data: {
        userId: dto.userId,
        reasons: dto.reasons,
        riskScore: dto.riskScore,
        flaggedBy: dto.flaggedBy ?? 'SYSTEM',
        notes: dto.notes ?? undefined,
      },
    });
  }

  async getAllSuspiciousAccounts(filters?: { isResolved?: boolean }) {
    return this.prisma.suspiciousAccount.findMany({
      where: {
        ...(filters?.isResolved !== undefined && {
          isResolved: filters.isResolved,
        }),
      },
      include: { user: true },
      orderBy: [{ riskScore: 'desc' }, { flaggedAt: 'desc' }],
    });
  }

  async getSuspiciousAccountById(id: string) {
    const account = await this.prisma.suspiciousAccount.findUnique({
      where: { id },
      include: {
        user: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!account) throw new NotFoundException('Suspicious account not found');
    return account;
  }

  async resolveFlag(id: string, opsUserId: string, notes?: string) {
    const account = await this.prisma.suspiciousAccount.findUnique({
      where: { id },
    });
    if (!account) throw new NotFoundException('Suspicious account not found');

    return this.prisma.suspiciousAccount.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        reviewedBy: opsUserId,
        reviewedAt: new Date(),
        notes: notes ?? undefined,
      },
    });
  }

  async blockUser(userId: string, opsUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'BLOCKED' },
    });

    await this.prisma.auditLog.create({
      data: {
        performedBy: opsUserId,
        action: AuditAction.USER_BLOCKED,
        metadata: { userId },
      },
    });

    return { message: 'User blocked successfully' };
  }

  async unblockUser(userId: string, opsUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' },
    });

    await this.prisma.auditLog.create({
      data: {
        performedBy: opsUserId,
        action: AuditAction.USER_UNBLOCKED,
        metadata: { userId },
      },
    });

    return { message: 'User unblocked successfully' };
  }

  async getAccountStats() {
    const [totalFlagged, pendingReview, blocked] = await Promise.all([
      this.prisma.suspiciousAccount.count({ where: { isResolved: false } }),
      this.prisma.suspiciousAccount.count({
        where: { isResolved: false, reviewedBy: null },
      }),
      this.prisma.user.count({ where: { accountStatus: 'BLOCKED' } }),
    ]);

    return { totalFlagged, pendingReview, blocked };
  }
}
