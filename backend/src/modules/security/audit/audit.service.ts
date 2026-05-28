import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogsByEntity(
    entity: 'sos' | 'fraud' | 'incident' | 'account',
    entityId: string,
  ) {
    const where = {
      sos: { sosAlertId: entityId },
      fraud: { fraudCaseId: entityId },
      incident: { incidentId: entityId },
      account: { suspiciousAccountId: entityId },
    }[entity];

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAuditStats() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [totalToday, byAction] = await Promise.all([
      this.prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        where: { createdAt: { gte: today } },
      }),
    ]);

    return { totalToday, byAction };
  }
  
  async getAllLogs(filters?: {
    performedBy?: string;
    action?: AuditAction;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          ...(filters?.performedBy && {
            performedBy: { contains: filters.performedBy, mode: 'insensitive' },
          }),
          ...(filters?.action && { action: filters.action }),
          ...((filters?.from || filters?.to) && {
            createdAt: {
              ...(filters?.from && { gte: filters.from }),
              ...(filters?.to && { lte: filters.to }),
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: {
          ...(filters?.performedBy && {
            performedBy: { contains: filters.performedBy, mode: 'insensitive' },
          }),
          ...(filters?.action && { action: filters.action }),
          ...((filters?.from || filters?.to) && {
            createdAt: {
              ...(filters?.from && { gte: filters.from }),
              ...(filters?.to && { lte: filters.to }),
            },
          }),
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
