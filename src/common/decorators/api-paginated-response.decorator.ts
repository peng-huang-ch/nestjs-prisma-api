import { applyDecorators, Type } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { Type as Transformer } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SortOrder {
  DESC = 'desc',
  ASC = 'asc',
}

export function getPagination(pagination?: ApiPaginatedQuery, ext?: Partial<ApiPaginatedQuery>) {
  let perPage = pagination?.perPage || ext?.perPage || 10;
  perPage = Math.max(+perPage || 10, 1);

  let page = pagination?.page || ext?.page || 0;
  page = Math.max(+page || 1, 1);

  const sortBy = pagination?.sortBy || ext?.sortBy || 'createdAt';
  const sortOrder = pagination?.sortOrder || ext?.sortOrder || SortOrder.DESC;
  const options = { page, perPage, orderBy: { [sortBy]: sortOrder } };
  return options;
}

export class ApiPaginatedQuery {
  @ApiProperty({ required: false, example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transformer(() => Number)
  perPage: number;

  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @Transformer(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ required: false, example: 'id', default: 'id' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: SortOrder, example: 'desc', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export const ApiPaginatedRes = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
          {
            properties: {
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  isFirstPage: { type: 'boolean', example: true },
                  isLastPage: { type: 'boolean', example: false },
                  currentPage: { type: 'number', example: 1 },
                  nextPage: { type: 'number', example: 2 },
                  pageCount: { type: 'number', example: 4 },
                  totalCount: { type: 'number', example: 10 },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const Api200Res = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(ApiOkResponse({ type: model }));
};

export const Api400Res = (message: string) => {
  return applyDecorators(
    ApiBadRequestResponse({
      schema: {
        title: 'BadRequestResponse',
        properties: {
          message: { type: 'string', example: message },
          error: { type: 'string', example: 'Bad Request' },
          statusCode: { type: 'number', example: 400 },
        },
      },
    }),
  );
};
