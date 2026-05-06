import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DecisionModule } from './modules/decision/decision.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    DecisionModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
