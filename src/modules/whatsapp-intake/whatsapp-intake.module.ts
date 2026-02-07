import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsAppIntakeService } from './whatsapp-intake.service';
import { WhatsAppIntakeController } from './whatsapp-intake.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppIntakeController],
  providers: [WhatsAppIntakeService],
  exports: [WhatsAppIntakeService],
})
export class WhatsAppIntakeModule {}
