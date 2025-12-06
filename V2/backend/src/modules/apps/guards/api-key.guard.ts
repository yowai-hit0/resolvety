import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AppsService } from '../apps.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private appsService: AppsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get API key from header (X-API-Key or Authorization: Bearer)
    let apiKey: string | undefined;
    
    const apiKeyHeader = request.headers['x-api-key'];
    const authHeader = request.headers.authorization;
    
    if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    }

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Get client IP
    let clientIp = request.ip || 
                   request.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   request.connection?.remoteAddress ||
                   request.socket?.remoteAddress ||
                   'unknown';
    
    // Handle IPv6 localhost (::1) - convert to IPv4 localhost
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
      clientIp = '127.0.0.1';
    }
    
    // Remove IPv6 prefix if present
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    try {
      // Verify API key and check IP whitelist
      const { app, apiKeyRecord } = await this.appsService.verifyApiKey(apiKey, clientIp);
      
      // Attach app and API key info to request
      request.app = app;
      request.apiKey = apiKeyRecord;
      
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid API key');
    }
  }
}

