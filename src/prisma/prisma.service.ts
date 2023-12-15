import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import cursorStream from 'prisma-cursorstream';
import { pagination } from 'prisma-extension-pagination';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('prisma');
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  get stream() {
    return this.$extends(cursorStream);
  }

  get pagination() {
    return this.$extends(pagination());
  }

  async onModuleInit() {
    await this.$connect();

    // it will print prisma query sql, maybe leak sensitive data
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.log(e);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}
