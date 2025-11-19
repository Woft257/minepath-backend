import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { KolDashboardService } from './kol-dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('KOL Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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
}

