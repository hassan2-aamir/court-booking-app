const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
    console.log('WhatsApp Bot is ready! 🚀');
});

// Handle authentication
client.on('authenticated', () => {
    console.log('Successfully authenticated!');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

// Handle incoming messages
client.on('message', async (message) => {
    console.log(`Message from ${message.from}: ${message.body}`);
    
    // Ignore messages from groups and status updates
    if (message.from === 'status@broadcast') return;
    if (message.isGroupMsg) return;

    const messageBody = message.body.toLowerCase().trim();
    let response = '';

    // Bot commands
    switch (messageBody) {
        case '/start':
        case 'hello':
        case 'hi':
            response = '👋 Hello! I\'m your WhatsApp bot.\n\nAvailable commands:\n• /help - Show commands\n• /time - Current time\n• /weather - Weather info\n• /joke - Random joke\n• /quote - Inspirational quote';
            break;

        case '/help':
            response = '🤖 *Bot Commands:*\n\n' +
                      '• /start or hello - Welcome message\n' +
                      '• /time - Get current time\n' +
                      '• /weather - Weather information\n' +
                      '• /joke - Get a random joke\n' +
                      '• /quote - Inspirational quote\n' +
                      '• /about - About this bot';
            break;

        case '/time':
            const now = new Date();
            response = `🕐 Current time: ${now.toLocaleString()}`;
            break;

        case '/weather':
            response = '🌤️ I\'d love to show you the weather, but I need to be connected to a weather API first!';
            break;

        case '/joke':
            const jokes = [
                'Why don\'t scientists trust atoms? Because they make up everything! ⚛️',
                'Why did the scarecrow win an award? He was outstanding in his field! 🌾',
                'Why don\'t programmers like nature? It has too many bugs! 🐛',
                'What do you call a fake noodle? An impasta! 🍝',
                'Why did the math book look so sad? Because it had too many problems! 📚'
            ];
            response = jokes[Math.floor(Math.random() * jokes.length)];
            break;

        case '/quote':
            const quotes = [
                '"The only way to do great work is to love what you do." - Steve Jobs',
                '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
                '"Life is what happens to you while you\'re busy making other plans." - John Lennon',
                '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
                '"It is during our darkest moments that we must focus to see the light." - Aristotle'
            ];
            response = '✨ ' + quotes[Math.floor(Math.random() * quotes.length)];
            break;

        case '/about':
            response = '🤖 *WhatsApp Bot v1.0*\n\nI\'m a simple bot built with Node.js and whatsapp-web.js.\n\nFeatures:\n• Automated responses\n• Interactive commands\n• Easy to customize\n\nCreated with ❤️ for automation';
            break;

        default:
            // Check if message contains certain keywords
            if (messageBody.includes('how are you')) {
                response = 'I\'m doing great! Thanks for asking. How can I help you? 😊';
            } else if (messageBody.includes('thank')) {
                response = 'You\'re welcome! Happy to help! 😊';
            } else if (messageBody.includes('bye')) {
                response = 'Goodbye! Feel free to message me anytime. 👋';
            } else {
                response = '🤔 I didn\'t understand that command.\n\nType /help to see available commands or just say "hello"!';
            }
            break;
    }

    // Send response
    if (response) {
        try {
            await message.reply(response);
            console.log(`Replied to ${message.from}: ${response}`);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Initialize client
console.log('Starting WhatsApp Bot...');
client.initialize();