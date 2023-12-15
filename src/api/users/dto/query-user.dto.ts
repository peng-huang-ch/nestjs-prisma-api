import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { ApiPaginatedQuery } from '@src/common';

export class QueryUsersDto extends ApiPaginatedQuery {
  @ApiProperty({ required: false, example: 'name' })
  @IsOptional()
  @IsString()
  q: string;
}
