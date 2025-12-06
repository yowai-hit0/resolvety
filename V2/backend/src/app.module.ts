import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PrioritiesModule } from './modules/tickets/priorities/priorities.module';
import { InvitesModule } from './modules/invites/invites.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AdminModule } from './modules/admin/admin.module';
import { AgentModule } from './modules/agent/agent.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AppsModule } from './modules/apps/apps.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    TicketsModule,
    UsersModule,
    CategoriesModule,
    PrioritiesModule,
    InvitesModule,
    OrganizationsModule,
    AdminModule,
    AgentModule,
    SettingsModule,
    AppsModule,
    PublicApiModule,
  ],
})
export class AppModule {}

