import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DecisionService } from '../decision/decision.service';
import { StorageService } from '../storage/storage.service';
import { CreateReportDto } from './dto/create-report.dto';
import { getPriorityLabel } from '../decision/priority.calculator';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly decisionService: DecisionService,
    private readonly storageService: StorageService,
  ) {}

  // ─── Read ────────────────────────────────────────────────────────────────────

  /**
   * Ambil semua laporan beserta skor AI (predictedPriority, aiScore, priorityLabel).
   */
  async findAll() {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return Promise.all(reports.map((r) => this.attachAiScore(r)));
  }

  /**
   * Ambil satu laporan berdasarkan ID beserta skor AI.
   */
  async findById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return this.attachAiScore(report);
  }

  // ─── Write ───────────────────────────────────────────────────────────────────

  /**
   * Buat laporan baru.
   * Jika severity/frequency/recency disertakan, hitung skor AI saat pembuatan.
   */
  async create(dto: CreateReportDto, userId: string) {
    const { severity, frequency, recency, ...reportData } = dto;

    // Hitung skor AI jika input SFR tersedia
    let aiMeta: {
      predictedPriority?: number;
      aiScore?: number;
      priorityLabel?: string;
      scoreSource?: string;
    } = {};

    if (severity !== undefined && frequency !== undefined && recency !== undefined) {
      try {
        const result = await this.decisionService.predict({ severity, frequency, recency });
        aiMeta = {
          predictedPriority: result.predictedPriority,
          aiScore: result.aiScore,
          priorityLabel: getPriorityLabel(result.predictedPriority),
          scoreSource: result.source,
        };
        this.logger.log(
          `Report created with AI score=${result.predictedPriority} (source=${result.source})`,
        );
      } catch (err) {
        this.logger.warn(`Gagal menghitung AI score saat create report: ${err}`);
      }
    }

    const report = await this.prisma.report.create({
      data: {
        ...reportData,
        severity,
        frequency,
        recency,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return { ...report, ...aiMeta };
  }

  /**
   * Upload foto laporan ke Amazon S3 via CloudFront.
   * URL CloudFront disimpan ke field fileUrl di database.
   */
  async uploadImage(reportId: string, file: Express.Multer.File) {
    // Pastikan laporan ada
    await this.findById(reportId);

    // Upload ke S3, dapatkan URL CloudFront
    const fileUrl = await this.storageService.uploadReportImage(file, reportId);

    // Simpan URL ke database
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { fileUrl },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(`Report ${reportId} image uploaded: ${fileUrl}`);
    return { ...updated, fileUrl };
  }

  /**
   * Update status laporan (pending → processing → completed / failed).
   */
  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.report.update({
      where: { id },
      data: { status: status as any },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    const report = await this.findById(id);

    // Hapus file dari S3 jika ada
    if ((report as any).fileUrl) {
      await this.storageService.deleteFile((report as any).fileUrl);
    }

    return this.prisma.report.delete({ where: { id } });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Tambahkan skor AI ke laporan.
   * Gunakan severity/frequency/recency dari laporan jika tersedia,
   * atau nilai default (5, 5, 5) untuk laporan lama.
   */
  private async attachAiScore<
    T extends { id: string; severity?: number | null; frequency?: number | null; recency?: number | null },
  >(report: T) {
    const sfr = {
      severity: report.severity ?? 5,
      frequency: report.frequency ?? 5,
      recency: report.recency ?? 5,
    };

    try {
      const result = await this.decisionService.predict(sfr);
      return {
        ...report,
        predictedPriority: result.predictedPriority,
        aiScore: result.aiScore,
        priorityLabel: getPriorityLabel(result.predictedPriority),
        scoreSource: result.source,
      };
    } catch {
      return {
        ...report,
        predictedPriority: 5.0,
        aiScore: 5.0,
        priorityLabel: 'medium' as const,
        scoreSource: 'rule-based' as const,
      };
    }
  }
}
