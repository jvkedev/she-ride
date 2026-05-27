import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  FraudType,
  FraudRiskLevel,
  FraudStatus,
  AuditAction,
} from '@prisma/client';

@Injectable()
export class FraudService {
  constructor(private readonly prisma: PrismaService) {}

  // ── FLAG A FRAUD CASE ─────────────────────────
  async flagFraudCase(dto: {
    userId: string;
    fraudType: FraudType;
    riskLevel: FraudRiskLevel;
    fraudScore: number;
    description?: string;
    evidence?: Record<string, any>;
    rideId?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const fraudCase = await this.prisma.fraudCase.create({
      data: {
        userId: dto.userId,
        rideId: dto.rideId ?? undefined,
        fraudType: dto.fraudType,
        riskLevel: dto.riskLevel,
        fraudScore: dto.fraudScore,
        description: dto.description ?? undefined,
        evidence: dto.evidence ?? undefined,
        status: FraudStatus.OPEN,
      },
      include: {
        user: true,
        ride: true,
      },
    });

    // auto block user if CRITICAL
    if (dto.riskLevel === FraudRiskLevel.CRITICAL) {
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: { accountStatus: 'BLOCKED' },
      });
    }

    await this.createAuditLog({
      performedBy: 'SYSTEM',
      action: AuditAction.FRAUD_FLAGGED,
      fraudCaseId: fraudCase.id,
      metadata: {
        fraudType: dto.fraudType,
        riskLevel: dto.riskLevel,
        fraudScore: dto.fraudScore,
      },
    });

    return fraudCase;
  }

  // ── INGEST RAW FRAUD SIGNAL ───────────────────
  async ingestSignal(dto: {
    userId: string;
    signalType: string;
    payload: Record<string, any>;
    score: number;
  }) {
    return this.prisma.fraudSignal.create({
      data: {
        userId: dto.userId,
        signalType: dto.signalType,
        payload: dto.payload,
        score: dto.score,
      },
    });
  }

  // ── GET ALL FRAUD CASES (ops queue) ───────────
  async getAllFraudCases(filters?: {
    status?: FraudStatus;
    riskLevel?: FraudRiskLevel;
  }) {
    return this.prisma.fraudCase.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.riskLevel && { riskLevel: filters.riskLevel }),
      },
      include: {
        user: true,
        ride: true,
      },
      orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // ── GET SINGLE FRAUD CASE DETAIL ──────────────
  async getFraudCaseById(fraudCaseId: string) {
    const fraudCase = await this.prisma.fraudCase.findUnique({
      where: { id: fraudCaseId },
      include: {
        user: true,
        ride: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!fraudCase) throw new NotFoundException('Fraud case not found');
    return fraudCase;
  }

  // ── GET FRAUD SIGNALS FOR A USER ──────────────
  async getUserSignals(userId: string) {
    return this.prisma.fraudSignal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── UPDATE FRAUD CASE STATUS (ops action) ─────
  async updateFraudCase(
    fraudCaseId: string,
    opsUserId: string,
    dto: {
      status: 'UNDER_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
      resolutionNote?: string;
    },
  ) {
    const fraudCase = await this.prisma.fraudCase.findUnique({
      where: { id: fraudCaseId },
    });
    if (!fraudCase) throw new NotFoundException('Fraud case not found');
    if (fraudCase.status === FraudStatus.RESOLVED) {
      throw new ForbiddenException('Fraud case is already resolved');
    }

    const updated = await this.prisma.fraudCase.update({
      where: { id: fraudCaseId },
      data: {
        status: dto.status as FraudStatus,
        reviewedBy: opsUserId,
        reviewedAt: new Date(),
        resolvedAt:
          dto.status === 'RESOLVED' || dto.status === 'FALSE_POSITIVE'
            ? new Date()
            : undefined,
        resolutionNote: dto.resolutionNote ?? undefined,
      },
    });

    await this.createAuditLog({
      performedBy: opsUserId,
      action: AuditAction.FRAUD_RESOLVED,
      fraudCaseId,
      metadata: { status: dto.status, note: dto.resolutionNote },
    });

    return updated;
  }

  // ── BLOCK USER FROM FRAUD CASE ────────────────
  async blockUserFromFraudCase(fraudCaseId: string, opsUserId: string) {
    const fraudCase = await this.prisma.fraudCase.findUnique({
      where: { id: fraudCaseId },
    });
    if (!fraudCase) throw new NotFoundException('Fraud case not found');

    await this.prisma.user.update({
      where: { id: fraudCase.userId },
      data: { accountStatus: 'BLOCKED' },
    });

    await this.createAuditLog({
      performedBy: opsUserId,
      action: AuditAction.USER_BLOCKED,
      fraudCaseId,
      metadata: { reason: 'Blocked via fraud case' },
    });

    return { message: 'User blocked successfully' };
  }

  // ── FRAUD STATS (overview cards) ──────────────
  async getFraudStats() {
    const [open, underReview, resolvedToday, critical] = await Promise.all([
      this.prisma.fraudCase.count({
        where: { status: FraudStatus.OPEN },
      }),
      this.prisma.fraudCase.count({
        where: { status: FraudStatus.UNDER_REVIEW },
      }),
      this.prisma.fraudCase.count({
        where: {
          status: FraudStatus.RESOLVED,
          resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.fraudCase.count({
        where: { riskLevel: FraudRiskLevel.CRITICAL },
      }),
    ]);

    return { open, underReview, resolvedToday, critical };
  }

  // ── PRIVATE: AUDIT LOG HELPER ─────────────────
  private async createAuditLog(data: {
    performedBy: string;
    action: AuditAction;
    fraudCaseId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        performedBy: data.performedBy,
        action: data.action,
        fraudCaseId: data.fraudCaseId ?? undefined,
        metadata: data.metadata ?? undefined,
      },
    });
  }
}
