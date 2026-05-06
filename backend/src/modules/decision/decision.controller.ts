import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DecisionService } from './decision.service';
import { PredictRequestDto } from './dto/predict-request.dto';
import { PredictResponseDto } from './dto/predict-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('decision')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('decision')
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  /**
   * Prediksi skor prioritas menggunakan ML service (dengan fallback rule-based).
   */
  @Post('predict')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Prediksi skor prioritas laporan',
    description:
      'Memanggil ML service untuk prediksi. Jika ML service tidak tersedia, ' +
      'otomatis menggunakan kalkulasi rule-based (weighted average SFR).',
  })
  @ApiResponse({ status: 200, type: PredictResponseDto })
  predict(@Body() dto: PredictRequestDto): Promise<PredictResponseDto> {
    return this.decisionService.predict(dto);
  }

  /**
   * Ambil semua laporan yang sudah di-enrich dengan skor AI.
   */
  @Get('reports')
  @ApiOperation({
    summary: 'Laporan dengan skor AI',
    description: 'Mengembalikan semua laporan beserta predictedPriority dan aiScore.',
  })
  getReportsWithAiScore() {
    return this.decisionService.getReportsWithAiScore();
  }

  /**
   * Ambil satu laporan berdasarkan ID beserta skor AI-nya.
   */
  @Get('reports/:id')
  @ApiParam({ name: 'id', description: 'ID laporan' })
  @ApiOperation({ summary: 'Detail laporan dengan skor AI' })
  getReportWithAiScore(@Param('id') id: string) {
    return this.decisionService.getReportWithAiScore(id);
  }

  /**
   * Riwayat keputusan yang tersimpan di database.
   */
  @Get('history')
  @ApiOperation({ summary: 'Riwayat keputusan AI' })
  getHistory() {
    return this.decisionService.getDecisionHistory();
  }

  /**
   * Status ML service — apakah aktif dan model sudah siap.
   */
  @Get('ml-status')
  @ApiOperation({
    summary: 'Status ML service',
    description: 'Cek apakah ML service aktif dan model sudah siap digunakan.',
  })
  getMlStatus() {
    return this.decisionService.getMlServiceStatus();
  }
}
