import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappBotGateway } from './whatsapp-bot.gateway';
import { WhatsappBotService } from './whatsapp-bot.service';

describe('WhatsappBotGateway', () => {
  let gateway: WhatsappBotGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappBotGateway, WhatsappBotService],
    }).compile();

    gateway = module.get<WhatsappBotGateway>(WhatsappBotGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
