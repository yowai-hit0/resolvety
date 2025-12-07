import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Exclude } from 'class-transformer';
import { TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  requester_email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requester_name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requester_phone: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  priority_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    // Convert empty strings, null, or undefined to undefined
    // This allows @IsOptional() to properly skip validation
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf((o) => o.assignee_id !== undefined && o.assignee_id !== null && o.assignee_id !== '')
  @IsUUID()
  assignee_id?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  category_ids: string[];
}

export class UpdateTicketDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    // Convert empty strings, null, or undefined to undefined
    // This allows @IsOptional() to properly skip validation
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf((o) => o.assignee_id !== undefined && o.assignee_id !== null && o.assignee_id !== '')
  @IsUUID()
  assignee_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  priority_id?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  category_ids?: string[];
}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_internal?: boolean;
}

export class BulkAssignDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ticket_ids: string[];

  @ApiProperty()
  @IsUUID()
  assignee_id: string;
}

export class BulkStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ticket_ids: string[];

  @ApiProperty()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class AddAttachmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  original_filename: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stored_filename: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  size: number;
}

