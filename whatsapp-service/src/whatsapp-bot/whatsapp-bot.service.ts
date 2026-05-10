import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import axios from 'axios';
import { login } from './whatsapp-bot.controller';
interface BookingSession {
  step: number;
  data: {
    name?: string;
    phone?: string;
    email?: string;
    cnic?: string;
    address?: string;
    courtId?: string;
    date?: string;
    slotId?: string;
    paymentMethod?: string;
    notes?: string;
    termsAccepted?: boolean;
    courts?: any[];
    slots?: any[];
    accessToken?: string; // <-- Add this
    isLoggedIn?: boolean;
    loginPhone?: string;
    loginPassword?: string;
  };
}


@Injectable()
export class WhatsappBotService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private sessions: Map<string, BookingSession> = new Map();

  private API_BASE_URL = process.env.API_BASE_URL || "localhost:3001";

  onModuleInit() {
    console.log('🚀 Initializing WhatsApp Bot...');

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'whatsapp-bot' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    this.client.on('qr', (qr) => {
      console.log('Scan this QR code with your WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot is ready!');
    });

    this.client.on('authenticated', () => {
      console.log('🔐 Successfully authenticated!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
    });

    this.client.on('message', async (message) => {
      if (message.from === 'status@broadcast' || message.isStatus) return;
      await this.handleBookingFlow(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ Client was disconnected:', reason);
    });

    this.client.initialize();
  }

  onModuleDestroy() {
    this.client.destroy();
  }

  // --- Booking Flow Handler ---
  private async handleBookingFlow(message: any) {
      const chatId = message.from;
  let session = this.sessions.get(chatId);

  // --- WhatsApp Login Flow ---
  if (message.body.toLowerCase() === '/login') {
    this.sessions.set(chatId, { step: 100, data: {} }); // 100 = login step
    await message.reply('Please enter your phone number (e.g. +923XXXXXXXXX):');
    return;
  }

  // Login step 1: Get phone
  if (session && session.step === 100) {
    session.data.loginPhone = message.body.trim();
    session.step = 101;
    await message.reply('Enter your password:');
    return;
  }

  // Login step 2: Get password and authenticate
  if (session && session.step === 101) {
    session.data.loginPassword = message.body.trim();
    // Call your backend login API
    try {
      const res = await axios.post(`http://${this.API_BASE_URL}/api/auth/login`, {
        phone: session.data.loginPhone,
        password: session.data.loginPassword,
      });
      session.data.accessToken = res.data.access_token;
      session.data.isLoggedIn = true;
      session.step = 1; // Optionally move to booking flow
      await message.reply('✅ Login successful! You can now use /book to start booking.');
    } catch (err) {
      await message.reply('❌ Login failed. Please check your credentials and try again. Type /login to retry.');
      this.sessions.delete(chatId);
    }
    return;
  }

    // --- Require login for booking ---
  if (!session && message.body.toLowerCase() === '/book') {
    await message.reply('You must login first. Type /login to begin.');
    return;
  }
  if (session && !session.data.isLoggedIn && message.body.toLowerCase() === '/book') {
    await message.reply('You must login first. Type /login to begin.');
    return;
  }

    if (!session) return;

    try {
      switch (session.step) {
        case 1:
          session.data.name = message.body;
          session.step++;
          await message.reply('Phone number?');
          break;
        case 2:
          session.data.phone = message.body;
          session.step++;
          await message.reply('Email address? (or type "skip")');
          break;
        case 3:
          session.data.email = message.body.toLowerCase() === 'skip' ? '' : message.body;
          session.step++;
          await message.reply('CNIC? (or type "skip")');
          break;
        case 4:
          session.data.cnic = message.body.toLowerCase() === 'skip' ? '' : message.body;
          session.step++;
          await message.reply('Address? (or type "skip")');
          break;
        case 5:
          session.data.address = message.body.toLowerCase() === 'skip' ? '' : message.body;
          session.step++;
          // Fetch courts from backend
          const courtsRes = await axios.get('http://localhost:3001/courts'); // <-- UPDATE URL
          const courts = courtsRes.data;
          session.data.courts = courts;
          let courtsList = courts.map((c, i) => `${i + 1}: ${c.name}`).join('\n');
          await message.reply(`Available courts:\n${courtsList}\nReply with the court number.`);
          break;
        case 6:
          {
            const idx = parseInt(message.body) - 1;
            if (
              isNaN(idx) ||
              !session.data.courts ||
              !session.data.courts[idx]
            ) {
              await message.reply('Invalid court number. Please try again.');
              return;
            }
            session.data.courtId = session.data.courts[idx].id;
            session.step++;
            await message.reply('Enter booking date (YYYY-MM-DD):');
          }
          break;
        case 7:
          session.data.date = message.body;
          // Fetch slots from backend
          const slotsRes = await axios.get(
            `http://localhost:3001/courts/${session.data.courtId}/slots?date=${session.data.date}` // <-- UPDATE URL
          );
          const slots = slotsRes.data;
          session.data.slots = slots;
          if (!slots.length) {
            await message.reply('No slots available for this date. Enter another date (YYYY-MM-DD):');
            return;
          }
          let slotsList = slots.map((s, i) => `${i + 1}: ${s.startTime}-${s.endTime}`).join('\n');
          session.step++;
          await message.reply(`Available slots:\n${slotsList}\nReply with the slot number.`);
          break;
        case 8:
          {
            const idx = parseInt(message.body) - 1;
            if (
              isNaN(idx) ||
              !session.data.slots ||
              !session.data.slots[idx]
            ) {
              await message.reply('Invalid slot number. Please try again.');
              return;
            }
            session.data.slotId = session.data.slots[idx].id;
            session.step++;
            await message.reply('Payment method? (Cash/Online)');
          }
          break;
        case 9:
          session.data.paymentMethod = message.body;
          session.step++;
          await message.reply('Any special notes? (or type "skip")');
          break;
        case 10:
          session.data.notes = message.body.toLowerCase() === 'skip' ? '' : message.body;
          session.step++;
          await message.reply('Do you accept the terms and conditions? (yes/no)');
          break;
        case 11:
          if (message.body.toLowerCase() !== 'yes') {
            await message.reply('Booking cancelled.');
            this.sessions.delete(chatId);
            break;
          }
          // Show summary and confirm
          const summary = `Please confirm your booking:\nName: ${session.data.name}\nPhone: ${session.data.phone}\nCourt: ${session.data.courtId}\nDate: ${session.data.date}\nSlot: ${session.data.slotId}\nPayment: ${session.data.paymentMethod}\nNotes: ${session.data.notes}\n\nReply 'yes' to confirm or 'no' to cancel.`;
          session.step++;
          await message.reply(summary);
          break;
        case 12:
          if (message.body.toLowerCase() === 'yes') {
            // Send booking to backend
            try {
              const bookingPayload = {
                customer: {
                  name: session.data.name,
                  phone: session.data.phone,
                  email: session.data.email,
                  cnic: session.data.cnic,
                  address: session.data.address,
                },
                courtId: session.data.courtId,
                date: session.data.date,
                slotId: session.data.slotId,
                paymentMethod: session.data.paymentMethod,
                notes: session.data.notes,
              };
              await axios.post('http://localhost:3001/bookings', bookingPayload); // <-- UPDATE URL
              await message.reply('✅ Booking created!');
            } catch (err) {
              await message.reply('❌ Booking failed. Please try again later.');
            }
          } else {
            await message.reply('Booking cancelled.');
          }
          this.sessions.delete(chatId);
          break;
        default:
          await message.reply('Type /book to start a new booking.');
          this.sessions.delete(chatId);
      }
    } catch (err) {
      await message.reply('⚠️ An error occurred. Please try again.');
      this.sessions.delete(chatId);
    }
  }
}