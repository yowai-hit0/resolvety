import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: 'In_Progress' })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class UpdateTicketPriorityDto {
  @ApiProperty({ type: String, example: 'uuid-here' })
  @IsUUID()
  priority_id: string;
}

