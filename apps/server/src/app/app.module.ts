import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { sqliteStore } from '@resolid/cache-manager-sqlite';
import { join } from 'path';

@Module({
  imports: [
    CacheModule.register({
      store: sqliteStore({
        sqliteFile: join(process.cwd(), 'cache.sqlite3'),
        cacheTableName: 'caches',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
