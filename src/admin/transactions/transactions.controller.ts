import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { FindTransactionsDto } from './dto/find-transactions.dto';

@ApiTags('Admin - Transactions')
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

