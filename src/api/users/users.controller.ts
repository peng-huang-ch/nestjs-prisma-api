import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { isEmpty } from 'lodash';
import { TraceService } from 'nestjs-otel';

import { Api200Res, Api400Res, ApiPaginatedRes, getPagination, JwtAuthGuard } from '@src/common';
import { UserEntity } from '@src/entities';
import { UsersManager } from '@src/services';

import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly traceSvc: TraceService,
    private readonly usersMgr: UsersManager,
  ) {}

  @ApiOperation({ operationId: 'create-user', summary: 'create user' })
  @ApiBearerAuth()
  @Api200Res(UserEntity)
  @Api400Res('email already used.')
  @Post()
  @HttpCode(200)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('create user');
    currentSpan?.end();
    const email = createUserDto.email;
    const used = await this.usersMgr.getUserByEmail(email);
    if (!isEmpty(used)) throw new BadRequestException('email already used.');
    return this.usersMgr.createUser(createUserDto);
  }

  @ApiOperation({ operationId: 'get-users', summary: 'get users' })
  @ApiPaginatedRes(UserEntity)
  // @ApiQuery({ type: QueryUsersDto })
  @Get()
  @HttpCode(200)
  async getUsers(@Query() queryUsersDto: QueryUsersDto) {
    const pagination = getPagination(queryUsersDto);
    const where = {};
    if (queryUsersDto.q) Object.assign(where, { name: { startsWith: queryUsersDto.q } });
    return this.usersMgr.usersSvc.paginate({ where, ...pagination });
  }

  @ApiOperation({ operationId: 'get_user' })
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('find user');
    currentSpan?.setAttribute('id', id);
    currentSpan?.end();

    return await this.usersMgr.getUserById(id);
  }

  @ApiOperation({ operationId: 'update-user', summary: 'update the user' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @ApiOkResponse({ type: UserEntity })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  // @Span()
  // @OtelMethodCounter()
  updateUser(@Req() req: Request, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (req.user!.id !== id) throw new BadRequestException('invalid user id');
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('patch user');
    currentSpan?.setAttribute('id', id);
    currentSpan?.end();

    return this.usersMgr.updateUserById(id, updateUserDto);
  }

  @ApiOperation({ operationId: 'remove-user', summary: 'remove the user' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @ApiOkResponse({ type: UserEntity })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeUser(@Req() req: Request, @Param('id') id: string) {
    if (req.user!.id !== id) throw new BadRequestException('invalid user id');
    return this.usersMgr.removeUserById(id);
  }
}
