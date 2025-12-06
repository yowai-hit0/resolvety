import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsEmail, MinLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  organization_id?: string; // Deprecated: use organization_ids instead

  @ApiPropertyOptional({ type: [String], description: 'Array of organization UUIDs to assign user to' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  organization_ids?: string[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional()
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  organization_id?: string; // Deprecated: use organization_ids instead

  @ApiPropertyOptional({ type: [String], description: 'Array of organization UUIDs to assign user to' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  organization_ids?: string[];
}

export class UpdateUserStatusDto {
  @ApiProperty()
  @IsBoolean()
  is_active: boolean;
}

