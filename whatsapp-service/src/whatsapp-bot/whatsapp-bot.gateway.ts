import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { WhatsappBotService } from './whatsapp-bot.service';
import { CreateWhatsappBotDto } from './dto/create-whatsapp-bot.dto';
import { UpdateWhatsappBotDto } from './dto/update-whatsapp-bot.dto';

@WebSocketGateway()
export class WhatsappBotGateway {
  constructor(private readonly whatsappBotService: WhatsappBotService) {}
}
