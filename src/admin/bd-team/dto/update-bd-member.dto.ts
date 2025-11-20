import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateBdMemberDto {
  @ApiProperty({ description: 'Commission rate (0.0 - 1.0)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate?: number;

  @ApiProperty({ description: 'SOL fee share (0.0 - 1.0)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  solFeeShare?: number;
}
