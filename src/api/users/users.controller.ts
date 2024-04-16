import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';

import { ApiPaginatedResponse, getPagination, MakeApi200Response, MakeApi400Response } from '@src/common';
import { UserEntity } from '@src/entities';
import { UsersManager } from '@src/services';

import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly traceSvc: TraceService,
    private readonly usersMgr: UsersManager,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ operationId: 'create_user', summary: 'create user' })
  @MakeApi200Response(UserEntity)
  @MakeApi400Response('email already used.')
  @ApiBody({
    isArray: false,
    type: CreateUserDto,
  })
  @Post()
  @Span('create_user')
  @OtelMethodCounter()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('create user');
    currentSpan?.end();
    const email = createUserDto.email;
    const used = await this.usersMgr.getUserByEmail(email);
    if (used) throw new BadRequestException('email already used.');
    return this.usersMgr.createUser(createUserDto);
  }

  @ApiPaginatedResponse(UserEntity)
  @ApiOperation({ operationId: 'get_users', summary: 'get user with pagination' })
  @ApiQuery({ type: QueryUsersDto })
  @Get()
  @Span()
  @OtelMethodCounter()
  async getUsers(@Query() queryUsersDto: QueryUsersDto) {
    const pagination = getPagination(queryUsersDto);
    const where = {};
    if (queryUsersDto.q) Object.assign(where, { name: { startsWith: queryUsersDto.q } });
    return this.usersMgr.usersSvc.paginate({ where, ...pagination });
  }

  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ operationId: 'get_user' })
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @Get(':id')
  @Span()
  @OtelMethodCounter()
  async getUser(@Param('id') id: string) {
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('find user');
    currentSpan?.setAttribute('id', id);
    currentSpan?.end();

    return await this.usersMgr.getUserById(id);
  }

  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ operationId: 'update_user', summary: 'update the user' })
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @ApiBody({
    type: UpdateUserDto,
  })
  @Patch(':id')
  @Span()
  @OtelMethodCounter()
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const currentSpan = this.traceSvc.getSpan();
    currentSpan?.addEvent('patch user');
    currentSpan?.setAttribute('id', id);
    currentSpan?.end();

    return this.usersMgr.updateUserById(id, updateUserDto);
  }

  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ operationId: 'remove_user', summary: 'remove the user' })
  @ApiParam({ name: 'id', type: String, example: 'clra9rn8s0001wifc0wmwdavz' })
  @Delete(':id')
  @Span()
  @OtelMethodCounter()
  removeUser(@Param('id') id: string) {
    return this.usersMgr.removeUserById(id);
  }
}
