import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateCategoryDto {
  name: string;
}

class UpdateCategoryDto {
  name: string;
}

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() dto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(dto.name, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCategoryDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Request() req) {
    return this.categoriesService.update(id, dto.name, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string, @Request() req) {
    return this.categoriesService.delete(id, req.user.id);
  }
}

