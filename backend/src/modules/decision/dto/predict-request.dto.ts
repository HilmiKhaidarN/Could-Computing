import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class PredictRequestDto {
  @ApiProperty({
    description: 'Tingkat keparahan dampak (0–10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  severity: number;

  @ApiProperty({
    description: 'Frekuensi laporan dalam 30 hari terakhir (0–10)',
    example: 7.0,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  frequency: number;

  @ApiProperty({
    description: 'Kebaruan laporan — semakin baru semakin tinggi (0–10)',
    example: 9.0,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  recency: number;
}
