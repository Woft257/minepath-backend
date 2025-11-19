import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { FindTransactionsDto } from './dto/find-transactions.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Admin - Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}


  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  async getStats() {
    return this.transactionsService.getStats();
  }

    @Get()
  @ApiOperation({ summary: 'Get all transaction logs with filters and pagination' })
  async findAll(@Query() query: FindTransactionsDto) {
    return this.transactionsService.findAll(query);
  }
}

