import { PartialType } from '@nestjs/mapped-types';
import { CreateWhatsappBotDto } from './create-whatsapp-bot.dto';

export class UpdateWhatsappBotDto extends PartialType(CreateWhatsappBotDto) {
  id: number;
}
