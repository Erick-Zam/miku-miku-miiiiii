import express from 'express';
import wwebjs from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = wwebjs;
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';

// Set FFMPEG path for whatsapp-web.js (fluent-ffmpeg)
process.env.FFMPEG_PATH = ffmpegPath;
// Also add to PATH so child_process.spawn('ffmpeg') works
process.env.PATH = `${path.dirname(ffmpegPath)}${path.delimiter}${process.env.PATH}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

let client = null;

const initializeClient = () => {
    if (client) return;

    console.log('Initializing WhatsApp Client...');
    // Remove headless: false for production, but keep it for now if debugging is needed
    // For QR code, headless: true is fine and preferred
    client = new Client({
        authStrategy: new LocalAuth(),
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

    client.on('qr', (qr) => {
        console.log('QR Code received');
        QRCode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Error generating QR code', err);
                return;
            }
            io.emit('qr', url);
        });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        io.emit('ready');
    });

    client.on('authenticated', () => {
        console.log('Client is authenticated!');
        io.emit('authenticated');
    });

    client.on('auth_failure', (msg) => {
        console.error('AUTHENTICATION FAILURE', msg);
        io.emit('auth_failure', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('Client was disconnected', reason);
        client = null;
        io.emit('disconnected');
    });

    client.initialize();
};

io.on('connection', (socket) => {
    console.log('New client connected');

    // Start client immediately upon connection to generate QR
    if (!client) {
        initializeClient();
    } else {
        // If client exists but not ready, we might need to re-emit QR or status
        // For simplicity, we just let the events handle it
    }

    socket.on('send-message', async ({ number, message }) => {
        try {
            if (!client || !client.info) {
                throw new Error('Client not ready');
            }

            const formattedNumber = number.replace(/\D/g, '') + '@c.us';

            await client.sendMessage(formattedNumber, message);
            console.log(`Message sent to ${formattedNumber}`);
            socket.emit('message-sent');
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message: ' + error.message);
        }
    });

    socket.on('miku-attack', async ({ number }) => {
        try {
            if (!client || !client.info) {
                throw new Error('Client not ready');
            }

            const formattedNumber = number.replace(/\D/g, '') + '@c.us';

            // Sequence from the image
            const messages = [
                "Cagaste, jajajaja",
                "And now",
                "It's time",
                "For a moment to be waiting for......",
                "1.....",
                "2......",
                "3......",
                "Already?..."
            ];

            // Preload media to prevent delay between messages and stickers
            // Using pre-converted WebP to avoid ffmpeg processing delay
            const stickerPath = path.join(__dirname, 'miku.webp');
            const media = MessageMedia.fromFilePath(stickerPath);

            console.log(`Starting Miku Attack on ${formattedNumber}`);

            for (const msg of messages) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                await client.sendMessage(formattedNumber, msg);
                console.log(`Sent: ${msg}`);
            }

            // Send Sticker (Miku MP4)
            try {

                // Send 100 times (Spam Mode)
                for (let i = 0; i < 100; i++) {
                    // Removed await to send "de golpe" (fire and forget) - effectively spamming
                    client.sendMessage(formattedNumber, media, { sendMediaAsSticker: true });
                    console.log(`Sticker ${i + 1}/100 queued!`);
                    // No delay
                }
            } catch (stickerError) {
                console.error('Error sending sticker:', stickerError);
                // Don't fail the whole request if sticker fails, just log it
            }

            socket.emit('message-sent');
        } catch (error) {
            console.error('Error in Miku Attack:', error);
            socket.emit('error', 'Miku Attack failed: ' + error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
