import { Module } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';
import { WhatsappBotGateway } from './whatsapp-bot.gateway';

@Module({
  providers: [WhatsappBotGateway, WhatsappBotService],
})
export class WhatsappBotModule {}
