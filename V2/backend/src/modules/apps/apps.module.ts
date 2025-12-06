import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppsController],
  providers: [AppsService, ApiKeyGuard],
  exports: [AppsService, ApiKeyGuard],
})
export class AppsModule {}

