import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TripsModule } from './modules/trips/trips.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SubAgenciesModule } from './modules/sub-agencies/sub-agencies.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ChatModule } from './modules/chat/chat.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WhatsAppIntakeModule } from './modules/whatsapp-intake/whatsapp-intake.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    TripsModule,
    PricingModule,
    DriversModule,
    VehiclesModule,
    SubAgenciesModule,
    CommissionsModule,
    ExpensesModule,
    ChatModule,
    WhatsAppModule,
    TrackingModule,
    ReportsModule,
    DashboardModule,
    SettingsModule,
    WhatsAppIntakeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
