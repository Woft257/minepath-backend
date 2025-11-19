import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get key statistics for the main dashboard cards' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('sol-revenue')
  @ApiOperation({ summary: 'Get SOL revenue data for the chart' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of past days to get data for (default: 7)' })
  getSolRevenueOverTime(@Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number) {
    return this.dashboardService.getSolRevenueOverTime(days);
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get a list of the most recent transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions to return (default: 5)' })
  getRecentTransactions(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.dashboardService.getRecentTransactions(limit);
  }
}

