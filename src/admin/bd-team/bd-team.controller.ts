import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { BdTeamService } from './bd-team.service';
import { AddBdMemberDto } from './dto/add-bd-member.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Admin - BD Team')
@Controller('admin/bd-team')
export class BdTeamController {
  constructor(private readonly bdTeamService: BdTeamService) {}

    @Get()
  @ApiOperation({ summary: 'Get all BD members and their performance' })
  async findAll() {
    return this.bdTeamService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Add a new BD member' })
  async addBdMember(@Body() addBdMemberDto: AddBdMemberDto) {
    return this.bdTeamService.addBdMember(addBdMemberDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Remove a BD member' })
  @ApiParam({ name: 'uuid', description: 'The UUID of the BD member to remove' })
  async removeBdMember(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.bdTeamService.removeBdMember(uuid);
  }


}

