/**
 * MlClient — lapisan HTTP yang terisolasi untuk komunikasi dengan ML service.
 *
 * Semua logic terkait HTTP call ke FastAPI ada di sini.
 * DecisionService hanya memanggil metode di class ini tanpa tahu detail HTTP.
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { AxiosError } from 'axios';

/** Payload yang dikirim ke POST /predict */
export interface MlPredictPayload {
  severity: number;
  frequency: number;
  recency: number;
}

/** Response dari ML service */
export interface MlPredictResult {
  predicted_priority: number;
  model_version: string;
}

/** Hasil health check ML service */
export interface MlHealthResult {
  status: string;
  model_ready: boolean;
}

const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class MlClient {
  private readonly logger = new Logger(MlClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl =
      this.config.get<string>('ML_SERVICE_URL') ?? 'http://localhost:8000';
  }

  /**
   * Panggil POST /predict pada ML service.
   * Melempar error jika request gagal — caller bertanggung jawab untuk fallback.
   */
  async predict(payload: MlPredictPayload): Promise<MlPredictResult> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<MlPredictResult>(`${this.baseUrl}/predict`, payload)
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );
    return data;
  }

  /**
   * Cek apakah ML service aktif dan model sudah siap.
   * Tidak melempar error — mengembalikan false jika tidak tersedia.
   */
  async isHealthy(): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<MlHealthResult>(`${this.baseUrl}/health`)
          .pipe(timeout(REQUEST_TIMEOUT_MS)),
      );
      return data.status === 'ok' && data.model_ready === true;
    } catch {
      this.logger.warn('ML service health check failed — service mungkin tidak aktif.');
      return false;
    }
  }

  /**
   * Ambil metadata model dari ML service.
   * Mengembalikan null jika tidak tersedia.
   */
  async getModelInfo(): Promise<Record<string, unknown> | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<Record<string, unknown>>(`${this.baseUrl}/model/info`)
          .pipe(timeout(REQUEST_TIMEOUT_MS)),
      );
      return data;
    } catch {
      return null;
    }
  }
}
