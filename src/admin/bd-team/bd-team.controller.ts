import { Controller, Get, Post, Delete, Put, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { BdTeamService } from './bd-team.service';
import { AddBdMemberDto } from './dto/add-bd-member.dto';
import { UpdateBdMemberDto } from './dto/update-bd-member.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Admin - BD Team')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/bd-team')
export class BdTeamController {
  constructor(private readonly bdTeamService: BdTeamService) {}

    @Get()
  @ApiOperation({ summary: 'Get all BD members and their performance' })
  async findAll() {
    return this.bdTeamService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get BD member details' })
  @ApiParam({ name: 'uuid', description: 'The UUID of the BD member' })
  async getBdDetail(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.bdTeamService.getBdDetail(uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new BD member' })
  async addBdMember(@Body() addBdMemberDto: AddBdMemberDto) {
    return this.bdTeamService.addBdMember(addBdMemberDto);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update BD member commission rates' })
  @ApiParam({ name: 'uuid', description: 'The UUID of the BD member' })
  async updateBdMember(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() updateBdMemberDto: UpdateBdMemberDto) {
    return this.bdTeamService.updateBdMember(uuid, updateBdMemberDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Remove a BD member' })
  @ApiParam({ name: 'uuid', description: 'The UUID of the BD member to remove' })
  async removeBdMember(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.bdTeamService.removeBdMember(uuid);
  }


}

