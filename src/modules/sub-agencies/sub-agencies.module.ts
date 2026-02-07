import { Module } from '@nestjs/common';
import { SubAgenciesService } from './sub-agencies.service';
import { SubAgenciesController } from './sub-agencies.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubAgenciesController],
  providers: [SubAgenciesService],
  exports: [SubAgenciesService],
})
export class SubAgenciesModule {}
