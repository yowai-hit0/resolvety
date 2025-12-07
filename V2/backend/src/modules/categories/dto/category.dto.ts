import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category' })
  @IsString()
  @MinLength(1)
  name: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Name of the category' })
  @IsString()
  @MinLength(1)
  name: string;
}

