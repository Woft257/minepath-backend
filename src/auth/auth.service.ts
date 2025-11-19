import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../database/entities/player.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const player = await this.playerRepository.findOne({ where: { username } });

    if (!player || !player.password || !(await bcrypt.compare(pass, player.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (player.role !== 'KOL' && player.role !== 'Admin') {
      throw new UnauthorizedException('User does not have the required role');
    }

    const payload = { sub: player.uuid, username: player.username, role: player.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

