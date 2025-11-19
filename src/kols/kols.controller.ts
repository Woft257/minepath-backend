import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { KolsService } from './kols.service';
import { AddKolDto } from './dto/add-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';

@ApiTags('KOLs Management')
@Controller('admin/kols')
export class KolsController {
  constructor(private readonly kolsService: KolsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get KOL statistics (Top by Volume and Referrals)' })
  @ApiResponse({ status: 200, description: 'Returns top KOL statistics' })
  async getStats() {
    return this.kolsService.getStats();
  }

  @Get('bd-managers')
  @ApiOperation({ summary: 'Get list of BD Managers' })
  @ApiResponse({ status: 200, description: 'Returns list of BD Managers' })
  async getBdManagers() {
    return this.kolsService.getBdManagers();
  }

  @Get()
  @ApiOperation({ summary: 'Get all KOLs with search and filtering' })
  @ApiResponse({ status: 200, description: 'Returns list of KOLs' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, wallet, or ref code' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (e.g., ACTIVE)' })
  async getAllKols(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.kolsService.getAllKols(search, status);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get detailed information about a specific KOL' })
  @ApiResponse({ status: 200, description: 'Returns KOL details' })
  async getKolDetails(@Param('uuid') uuid: string) {
    return this.kolsService.getKolDetails(uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new KOL (assign KOL role to existing user)' })
  @ApiResponse({ status: 201, description: 'KOL added successfully' })
  async addKol(@Body() addKolDto: AddKolDto) {
    return this.kolsService.addKol(addKolDto);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update KOL configuration (BD Manager, commission rates)' })
  @ApiResponse({ status: 200, description: 'KOL updated successfully' })
  async updateKol(@Param('uuid') uuid: string, @Body() updateKolDto: UpdateKolDto) {
    return this.kolsService.updateKol(uuid, updateKolDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Remove KOL role from user' })
  @ApiResponse({ status: 200, description: 'KOL removed successfully' })
  async removeKol(@Param('uuid') uuid: string) {
    return this.kolsService.removeKol(uuid);
  }
}

