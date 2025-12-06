import { IsString, IsOptional, IsEmail, IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApiRegisterUserDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Optional email address for the new user' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password for the new user (minimum 8 characters recommended)' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number (mandatory)' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class ApiCreateTicketDto {
  @ApiProperty({ example: 'API Created Ticket', description: 'Subject/title of the ticket' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'This ticket was created via the integration API', description: 'Detailed description of the ticket' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the user creating the ticket (obtained from GET /api/v1/users/profile)' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({ example: 'Office Building A, Room 101', description: 'Optional location information' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the priority level' })
  @IsUUID()
  @IsNotEmpty()
  priority_id: string;

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    description: 'Optional array of category UUIDs to assign to the ticket' 
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  category_ids?: string[];
}

