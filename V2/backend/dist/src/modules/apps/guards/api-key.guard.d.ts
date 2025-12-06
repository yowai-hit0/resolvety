import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppsService } from '../apps.service';
export declare class ApiKeyGuard implements CanActivate {
    private appsService;
    constructor(appsService: AppsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
