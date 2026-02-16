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
exports.IssuesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const issues_service_1 = require("./issues.service");
const create_issue_dto_1 = require("./dto/create-issue.dto");
const update_issue_status_dto_1 = require("./dto/update-issue-status.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let IssuesController = class IssuesController {
    issuesService;
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    create(dto, user) {
        return this.issuesService.create(dto, user);
    }
    list(user, projectId, status, type) {
        return this.issuesService.list(user, projectId, status, type);
    }
    updateStatus(id, dto) {
        return this.issuesService.updateStatus(id, dto);
    }
};
exports.IssuesController = IssuesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PM, role_enum_1.Role.INSTALLER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_issue_dto_1.CreateIssueDto, Object]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PM),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_issue_status_dto_1.UpdateIssueStatusDto]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "updateStatus", null);
exports.IssuesController = IssuesController = __decorate([
    (0, common_1.Controller)('issues'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], IssuesController);
//# sourceMappingURL=issues.controller.js.map