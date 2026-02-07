import { Module } from '@nestjs/common';
import { CommissionsModule } from '../commissions/commissions.module';
import { ChatModule } from '../chat/chat.module';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [CommissionsModule, ChatModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
