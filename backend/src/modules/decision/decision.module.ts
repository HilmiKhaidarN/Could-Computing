import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { MlClient } from './ml.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  providers: [DecisionService, MlClient],
  controllers: [DecisionController],
  exports: [DecisionService, MlClient],
})
export class DecisionModule {}
