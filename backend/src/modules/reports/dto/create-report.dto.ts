import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'Jalan Berlubang di Jl. Merdeka' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Lubang besar berdiameter 1 meter, berbahaya bagi pengendara.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Jalan Rusak' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 12, Bandung' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Tingkat keparahan dampak (0–10). Digunakan untuk kalkulasi AI score.',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  severity?: number;

  @ApiPropertyOptional({
    description: 'Frekuensi laporan serupa dalam 30 hari terakhir (0–10).',
    example: 7.0,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  frequency?: number;

  @ApiPropertyOptional({
    description: 'Kebaruan laporan — semakin baru semakin tinggi (0–10).',
    example: 9.0,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  recency?: number;
}
