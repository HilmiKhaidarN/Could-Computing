import { ApiProperty } from '@nestjs/swagger';

export class PredictResponseDto {
  @ApiProperty({ description: 'Skor prioritas hasil prediksi ML (0–10)', example: 8.18 })
  predictedPriority: number;

  @ApiProperty({ description: 'Skor AI yang sudah dibulatkan', example: 8.2 })
  aiScore: number;

  @ApiProperty({
    description: 'Sumber skor: ml-model jika ML service aktif, rule-based jika fallback',
    example: 'ml-model',
    enum: ['ml-model', 'rule-based'],
  })
  source: 'ml-model' | 'rule-based';

  @ApiProperty({ description: 'Input yang digunakan untuk prediksi' })
  inputs: {
    severity: number;
    frequency: number;
    recency: number;
  };
}
