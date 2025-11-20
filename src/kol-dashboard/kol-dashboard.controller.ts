import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { KolDashboardService } from './kol-dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('KOL Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.KOL)
@Controller('kol-dashboard')
export class KolDashboardController {
  constructor(private readonly kolDashboardService: KolDashboardService) {}

    @Get('stats')
  async getStats(@Request() req) {
    // The user's UUID is attached to the request by the AuthGuard
    const playerUuid = req.user.sub;
    return this.kolDashboardService.getStats(playerUuid);
  }

  @Get('referral-growth')
  async getReferralGrowth(@Request() req) {
    const playerUuid = req.user.sub;
    return this.kolDashboardService.getReferralGrowth(playerUuid);
  }

  @Get('commission-breakdown')
  async getCommissionBreakdown(@Request() req) {
    const playerUuid = req.user.sub;
    return this.kolDashboardService.getCommissionBreakdown(playerUuid);
  }

  @Get('top-referrals')
  async getTopReferrals(@Request() req, @Query() paginationDto: PaginationDto) {
    const playerUuid = req.user.sub;
    return this.kolDashboardService.getTopReferrals(playerUuid, paginationDto);
  }

  @Get('commission-history')
  async getCommissionHistory(@Request() req, @Query() paginationDto: PaginationDto) {
    const playerUuid = req.user.sub;
    return this.kolDashboardService.getCommissionHistory(playerUuid, paginationDto);
  }
}

