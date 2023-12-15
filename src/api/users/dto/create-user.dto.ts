import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: false, example: 'alice' })
  name: string;

  @ApiProperty({ required: true, example: 'alice@gmail.com' })
  email: string;
}
