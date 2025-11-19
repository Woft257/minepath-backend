import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class AddBdMemberDto {
  @ApiProperty({ description: 'Username of the user to promote', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.refCode)
  @IsNotEmpty()
  username?: string;

  @ApiProperty({ description: 'Ref Code of the user to promote', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.username)
  @IsNotEmpty()
  refCode?: string;

  @ApiProperty({ description: 'MINE commission rate (e.g., 0.3 for 30%)', required: false })
  @IsNumber()
  @IsOptional()
  commissionRate?: number;

  @ApiProperty({ description: 'SOL fee share (e.g., 0.1 for 10%)', required: false })
  @IsNumber()
  @IsOptional()
  solFeeShare?: number;
}

