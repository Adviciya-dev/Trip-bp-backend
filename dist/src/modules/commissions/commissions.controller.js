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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const commissions_service_1 = require("./commissions.service");
const create_commission_rule_dto_1 = require("./dto/create-commission-rule.dto");
const update_commission_rule_dto_1 = require("./dto/update-commission-rule.dto");
const query_commissions_dto_1 = require("./dto/query-commissions.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let CommissionsController = class CommissionsController {
    commissionsService;
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    findAllRules(subAgencyId, user) {
        return this.commissionsService.findAllRules(user.orgId, subAgencyId);
    }
    createRule(dto, user) {
        return this.commissionsService.createRule(dto, user.orgId);
    }
    updateRule(id, dto, user) {
        return this.commissionsService.updateRule(id, dto, user.orgId);
    }
    findAllLedger(query, user) {
        return this.commissionsService.findAllLedger(query, user.orgId);
    }
    getLedgerStats(user) {
        return this.commissionsService.getLedgerStats(user.orgId);
    }
    approve(id, user) {
        return this.commissionsService.approveCommission(id, user.orgId);
    }
    reject(id, user) {
        return this.commissionsService.rejectCommission(id, user.orgId);
    }
    bulkApprove(body, user) {
        return this.commissionsService.bulkApprove(body.ids, user.orgId);
    }
    async findAgencyLedger(query, user) {
        const subAgencyId = await this.commissionsService.resolveSubAgencyId(user.userId);
        return this.commissionsService.findLedgerForSubAgency(query, user.orgId, subAgencyId);
    }
    async getAgencyLedgerStats(user) {
        const subAgencyId = await this.commissionsService.resolveSubAgencyId(user.userId);
        return this.commissionsService.getLedgerStats(user.orgId, subAgencyId);
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Get)('rules'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('subAgencyId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findAllRules", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_commission_rule_dto_1.CreateCommissionRuleDto, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Patch)('rules/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_commission_rule_dto_1.UpdateCommissionRuleDto, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_commissions_dto_1.QueryCommissionsDto, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findAllLedger", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getLedgerStats", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('bulk-approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "bulkApprove", null);
__decorate([
    (0, common_1.Get)('agency'),
    (0, roles_decorator_1.Roles)('SUB_AGENCY_USER'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_commissions_dto_1.QueryCommissionsDto, Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "findAgencyLedger", null);
__decorate([
    (0, common_1.Get)('agency/stats'),
    (0, roles_decorator_1.Roles)('SUB_AGENCY_USER'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getAgencyLedgerStats", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, common_1.Controller)('commissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map