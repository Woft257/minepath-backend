import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateKolDto {
  @ApiProperty({ description: 'UUID of the BD Manager to assign', required: false })
  @IsString()
  @IsOptional()
  managedByUuid?: string;

  @ApiProperty({ description: 'SOL fee share (e.g., 0.1 for 10%)', required: false })
  @IsNumber()
  @IsOptional()
  solFeeShare?: number;

  @ApiProperty({ description: 'MINE commission rate (percentage)', required: false })
  @IsNumber()
  @IsOptional()
  commissionRate?: number;
}

