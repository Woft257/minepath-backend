import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class AddKolDto {
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

  @ApiProperty({ description: 'UUID of the BD Manager to assign', required: false })
  @IsUUID()
  @IsOptional()
  managedByUuid?: string;

  @ApiProperty({ description: 'MINE commission rate (e.g., 0.3 for 30%)', required: false })
  @IsNumber()
  @IsOptional()
  commissionRate?: number;

  @ApiProperty({ description: 'SOL fee share (e.g., 0.1 for 10%)', required: false })
  @IsNumber()
  @IsOptional()
  solFeeShare?: number;
}

