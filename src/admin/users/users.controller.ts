import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Admin Dashboard') // Group all APIs under this tag
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/users') // Prefix all routes in this controller with 'admin/users'
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics for the Users Board dashboard' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of users for the User Board' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by username or wallet' })
  @ApiQuery({ name: 'volume', required: false, type: String, description: 'Sort by volume (ASC or DESC)' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('volume', new DefaultValuePipe('DESC')) volume: string,
  ) {
    return this.usersService.findAll(page, limit, search, volume);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get details for a specific user' })
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOne(uuid);
  }
}

