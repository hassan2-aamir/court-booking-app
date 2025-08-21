import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotGateway } from './whatsapp-bot/whatsapp-bot.gateway';
import { WhatsappBotModule } from './whatsapp-bot/whatsapp-bot.module';
import { WhatsappBotService } from './whatsapp-bot/whatsapp-bot.service';

@Module({
  imports: [WhatsappBotModule],
  controllers: [AppController],
  providers: [AppService, WhatsappBotService],
})
export class AppModule {}
