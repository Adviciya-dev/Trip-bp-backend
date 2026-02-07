"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const trips_service_1 = require("./trips.service");
const create_trip_dto_1 = require("./dto/create-trip.dto");
const update_trip_dto_1 = require("./dto/update-trip.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const query_trips_dto_1 = require("./dto/query-trips.dto");
const assign_trip_dto_1 = require("./dto/assign-trip.dto");
const decline_trip_dto_1 = require("./dto/decline-trip.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let TripsController = class TripsController {
    tripsService;
    constructor(tripsService) {
        this.tripsService = tripsService;
    }
    create(dto, user) {
        return this.tripsService.create(dto, user);
    }
    findAll(query, user) {
        return this.tripsService.findAll(query, user.orgId);
    }
    getStats(user) {
        return this.tripsService.getStats(user.orgId);
    }
    async findAllForAgency(query, user) {
        const subAgencyId = await this.tripsService.resolveSubAgencyId(user.userId);
        return this.tripsService.findAllForSubAgency(query, user.orgId, subAgencyId);
    }
    async getAgencyStats(user) {
        const subAgencyId = await this.tripsService.resolveSubAgencyId(user.userId);
        return this.tripsService.getStatsForSubAgency(user.orgId, subAgencyId);
    }
    async findAllForDriver(query, user) {
        const driverId = await this.tripsService.resolveDriverId(user.userId);
        return this.tripsService.findAllForDriver(query, user.orgId, driverId);
    }
    async getDriverStats(user) {
        const driverId = await this.tripsService.resolveDriverId(user.userId);
        return this.tripsService.getStatsForDriver(user.orgId, driverId);
    }
    findOne(id, user) {
        return this.tripsService.findOne(id, user.orgId);
    }
    getTimeline(id, user) {
        return this.tripsService.getTimeline(id, user.orgId);
    }
    updateStatus(id, dto, user) {
        return this.tripsService.updateStatus(id, dto, user);
    }
    assignTrip(id, dto, user) {
        return this.tripsService.assignTrip(id, dto, user);
    }
    acceptAssignment(id, user) {
        return this.tripsService.acceptAssignment(id, user);
    }
    declineAssignment(id, dto, user) {
        return this.tripsService.declineAssignment(id, dto, user);
    }
    update(id, dto, user) {
        return this.tripsService.update(id, dto, user);
    }
    remove(id, user) {
        return this.tripsService.softDelete(id, user.orgId);
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trip_dto_1.CreateTripDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_trips_dto_1.QueryTripsDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('agency'),
    (0, roles_decorator_1.Roles)('SUB_AGENCY_USER'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_trips_dto_1.QueryTripsDto, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "findAllForAgency", null);
__decorate([
    (0, common_1.Get)('agency/stats'),
    (0, roles_decorator_1.Roles)('SUB_AGENCY_USER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getAgencyStats", null);
__decorate([
    (0, common_1.Get)('driver'),
    (0, roles_decorator_1.Roles)('DRIVER'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_trips_dto_1.QueryTripsDto, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "findAllForDriver", null);
__decorate([
    (0, common_1.Get)('driver/stats'),
    (0, roles_decorator_1.Roles)('DRIVER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getDriverStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_trip_dto_1.AssignTripDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "assignTrip", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "acceptAssignment", null);
__decorate([
    (0, common_1.Post)(':id/decline'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, decline_trip_dto_1.DeclineTripDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "declineAssignment", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_trip_dto_1.UpdateTripDto, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "remove", null);
exports.TripsController = TripsController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER'),
    __metadata("design:paramtypes", [trips_service_1.TripsService])
], TripsController);
//# sourceMappingURL=trips.controller.js.map