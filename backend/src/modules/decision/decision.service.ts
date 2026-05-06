import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MlClient } from './ml.client';
import { calculatePriority, getPriorityLabel } from './priority.calculator';
import type { PredictRequestDto } from './dto/predict-request.dto';
import type { PredictResponseDto } from './dto/predict-response.dto';

@Injectable()
export class DecisionService {
  private readonly logger = new Logger(DecisionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mlClient: MlClient,
  ) {}

  // ─── Core prediction ────────────────────────────────────────────────────────

  /**
   * Prediksi skor prioritas menggunakan ML service.
   * Jika ML service tidak tersedia atau response tidak valid,
   * otomatis fallback ke kalkulasi rule-based.
   */
  async predict(dto: PredictRequestDto): Promise<PredictResponseDto> {
    const inputs = {
      severity: dto.severity,
      frequency: dto.frequency,
      recency: dto.recency,
    };

    // Coba ML service terlebih dahulu
    try {
      const mlResult = await this.mlClient.predict(inputs);

      const predictedPriority = this.sanitizeScore(mlResult.predicted_priority);

      this.logger.log(
        `ML prediction OK — score=${predictedPriority} (severity=${inputs.severity}, frequency=${inputs.frequency}, recency=${inputs.recency})`,
      );

      return {
        predictedPriority,
        aiScore: Math.round(predictedPriority * 10) / 10,
        source: 'ml-model',
        inputs,
      };
    } catch (err) {
      // Fallback ke rule-based jika ML service tidak tersedia
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `ML service tidak tersedia, menggunakan rule-based fallback. Alasan: ${errorMessage}`,
      );

      const fallbackScore = calculatePriority(inputs);

      return {
        predictedPriority: fallbackScore,
        aiScore: Math.round(fallbackScore * 10) / 10,
        source: 'rule-based',
        inputs,
      };
    }
  }

  // ─── Reports with AI score ───────────────────────────────────────────────────

  /**
   * Ambil semua laporan dari database dan enrichment dengan skor AI.
   * Setiap laporan mendapat field predictedPriority dan aiScore.
   */
  async getReportsWithAiScore() {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    // Enrich setiap laporan secara paralel
    const enriched = await Promise.all(
      reports.map((report) => this.enrichReportWithScore(report)),
    );

    return enriched;
  }

  /**
   * Ambil satu laporan berdasarkan ID dan enrichment dengan skor AI.
   */
  async getReportWithAiScore(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    if (!report) return null;
    return this.enrichReportWithScore(report);
  }

  // ─── Decision history ────────────────────────────────────────────────────────

  async getDecisionHistory() {
    return this.prisma.decision.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  // ─── ML service status ───────────────────────────────────────────────────────

  async getMlServiceStatus() {
    const [isHealthy, modelInfo] = await Promise.all([
      this.mlClient.isHealthy(),
      this.mlClient.getModelInfo(),
    ]);

    return {
      available: isHealthy,
      modelInfo: modelInfo ?? null,
    };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Tambahkan predictedPriority, aiScore, dan priorityLabel ke laporan.
   * Menggunakan nilai default jika prediksi gagal.
   */
  private async enrichReportWithScore<T extends { id: string }>(report: T) {
    // Gunakan nilai default jika tidak ada data severity/frequency/recency
    // (laporan lama mungkin tidak memiliki field ini)
    const DEFAULT_INPUTS = { severity: 5, frequency: 5, recency: 5 };

    try {
      const result = await this.predict(DEFAULT_INPUTS);
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

  /**
   * Validasi dan sanitasi nilai skor dari ML service.
   * Mengembalikan nilai default 5.0 jika tidak valid.
   */
  private sanitizeScore(value: unknown): number {
    const num = Number(value);
    if (isNaN(num)) return 5.0;
    return Math.round(Math.min(10, Math.max(0, num)) * 100) / 100;
  }
}
