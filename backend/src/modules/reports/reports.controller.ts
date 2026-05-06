import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'Ambil semua laporan',
    description:
      'Mengembalikan semua laporan beserta field AI: predictedPriority, aiScore, priorityLabel, scoreSource.',
  })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID laporan' })
  @ApiOperation({ summary: 'Detail laporan dengan skor AI' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Buat laporan baru',
    description:
      'Jika severity, frequency, dan recency disertakan, skor AI dihitung saat pembuatan.',
  })
  create(@Body() dto: CreateReportDto, @Request() req: { user: { id: string } }) {
    return this.reportsService.create(dto, req.user.id);
  }

  /**
   * Upload foto laporan ke Amazon S3.
   * File disimpan di S3 dan URL CloudFront disimpan ke database.
   * Akses file hanya melalui CloudFront, bukan langsung dari S3.
   */
  @Post(':id/upload')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'ID laporan' })
  @ApiOperation({
    summary: 'Upload foto laporan ke S3',
    description:
      'Upload foto bukti laporan. File disimpan di Amazon S3 dan diakses melalui CloudFront CDN.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Foto laporan (JPG/PNG, maks 5MB)' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Simpan di memory, lalu upload ke S3
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    return this.reportsService.uploadImage(id, file);
  }

  @Patch(':id/status')
  @ApiParam({ name: 'id', description: 'ID laporan' })
  @ApiOperation({ summary: 'Update status laporan' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.reportsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID laporan' })
  @ApiOperation({ summary: 'Hapus laporan' })
  remove(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}
