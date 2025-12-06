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
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const users_module_1 = require("./modules/users/users.module");
const categories_module_1 = require("./modules/categories/categories.module");
const priorities_module_1 = require("./modules/tickets/priorities/priorities.module");
const invites_module_1 = require("./modules/invites/invites.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const admin_module_1 = require("./modules/admin/admin.module");
const agent_module_1 = require("./modules/agent/agent.module");
const settings_module_1 = require("./modules/settings/settings.module");
const apps_module_1 = require("./modules/apps/apps.module");
const public_api_module_1 = require("./modules/public-api/public-api.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            tickets_module_1.TicketsModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            priorities_module_1.PrioritiesModule,
            invites_module_1.InvitesModule,
            organizations_module_1.OrganizationsModule,
            admin_module_1.AdminModule,
            agent_module_1.AgentModule,
            settings_module_1.SettingsModule,
            apps_module_1.AppsModule,
            public_api_module_1.PublicApiModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map