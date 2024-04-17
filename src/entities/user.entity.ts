import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';

export class UserEntity implements User {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  name: string;

  @ApiProperty({ required: true, nullable: false })
  email: string;

  @ApiProperty({ required: false, nullable: true })
  iconUrl: string | null;

  @ApiHideProperty()
  googleId: string | null;

  @ApiHideProperty()
  googleProps: Prisma.JsonValue | null;

  @ApiProperty({ required: false, nullable: true })
  roles: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
