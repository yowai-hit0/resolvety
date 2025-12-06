import { IsString, IsOptional, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppDto {
  @ApiProperty({ example: 'My Integration App', description: 'Name of the application' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'App for integrating with our external system', description: 'Optional description of the application' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the organization this app belongs to' })
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;
}

export class UpdateAppDto {
  @ApiPropertyOptional({ example: 'Updated App Name', description: 'Updated name of the application' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Updated description of the application' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the app is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class CreateApiKeyDto {
  @ApiPropertyOptional({ example: 'Production Key', description: 'Optional name for the API key' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z', description: 'Optional expiration date in ISO 8601 format' })
  @IsString()
  @IsOptional()
  expires_at?: string; // ISO date string
}

export class CreateIpWhitelistDto {
  @ApiProperty({ 
    example: '192.168.1.100', 
    description: 'IP address or CIDR notation (e.g., 192.168.1.0/24 for a subnet)' 
  })
  @IsString()
  @IsNotEmpty()
  ip_address: string; // Can be single IP or CIDR (e.g., 192.168.1.0/24)

  @ApiPropertyOptional({ example: 'Production server', description: 'Optional description for this IP whitelist entry' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateIpWhitelistDto {
  @ApiPropertyOptional({ example: '192.168.1.101', description: 'Updated IP address or CIDR notation' })
  @IsString()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Updated description for this IP whitelist entry' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this IP whitelist entry is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

