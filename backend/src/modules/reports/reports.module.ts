import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DecisionModule } from '../decision/decision.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DecisionModule, StorageModule],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
