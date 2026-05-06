import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [totalUsers, totalReports, totalDecisions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.report.count(),
      this.prisma.decision.count(),
    ]);

    return { totalUsers, totalReports, totalDecisions };
  }

  async getReportsByStatus() {
    return this.prisma.report.groupBy({
      by: ['status'],
      _count: { status: true },
    });
  }
}
