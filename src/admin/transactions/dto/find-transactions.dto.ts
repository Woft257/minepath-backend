import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTransactionsDto {
  @ApiProperty({ required: false, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Search by wallet address or transaction hash' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by transaction type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, description: 'Start date for filtering (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date for filtering (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

