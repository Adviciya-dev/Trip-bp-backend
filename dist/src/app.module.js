"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const trips_module_1 = require("./modules/trips/trips.module");
const pricing_module_1 = require("./modules/pricing/pricing.module");
const drivers_module_1 = require("./modules/drivers/drivers.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const sub_agencies_module_1 = require("./modules/sub-agencies/sub-agencies.module");
const commissions_module_1 = require("./modules/commissions/commissions.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const chat_module_1 = require("./modules/chat/chat.module");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const tracking_module_1 = require("./modules/tracking/tracking.module");
const reports_module_1 = require("./modules/reports/reports.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const settings_module_1 = require("./modules/settings/settings.module");
const whatsapp_intake_module_1 = require("./modules/whatsapp-intake/whatsapp-intake.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            trips_module_1.TripsModule,
            pricing_module_1.PricingModule,
            drivers_module_1.DriversModule,
            vehicles_module_1.VehiclesModule,
            sub_agencies_module_1.SubAgenciesModule,
            commissions_module_1.CommissionsModule,
            expenses_module_1.ExpensesModule,
            chat_module_1.ChatModule,
            whatsapp_module_1.WhatsAppModule,
            tracking_module_1.TrackingModule,
            reports_module_1.ReportsModule,
            dashboard_module_1.DashboardModule,
            settings_module_1.SettingsModule,
            whatsapp_intake_module_1.WhatsAppIntakeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map