import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TrackingController],
})
export class TrackingModule {}
