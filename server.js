require('dotenv').config();
const express = require('express');
const { scrapePharmacies } = require('./pharmacy_bot'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); 

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

let botStatus = {
    isRunning: false,
    lastRun: 'Never',
    status: 'Idle',
    logs: [] 
};

function addLog(message) {
    const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Casablanca' });
    const logLine = `[${time}] ${message}`;
    botStatus.logs.push(logLine);
    console.log(logLine); 
}

global.syncBotState = {
    start: (msg) => {
        botStatus.isRunning = true;
        botStatus.status = 'Processing...';
        botStatus.logs = []; 
        addLog(msg);
    },
    log: (msg) => {
        addLog(msg); 
    },
    success: () => {
        botStatus.lastRun = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' });
        botStatus.status = 'Success';
        botStatus.isRunning = false;
        addLog('✅ Whole cycle completed successfully! Telegram channel notified.');
    },
    failed: (errMsg) => {
        botStatus.status = 'Failed';
        botStatus.isRunning = false;
        addLog(`❌ Fatal Exception: ${errMsg}`);
    }
};

app.get('/api/status', (req, res) => {
    res.json(botStatus);
});

app.post('/api/trigger', async (req, res) => {
    if (botStatus.isRunning) {
        return res.status(400).json({ success: false, message: "Bot is already running!" });
    }

    res.json({ success: true, message: "Scraping cycle triggered successfully!" });

    try {
        global.syncBotState.start('🚀 Manual override triggered from dashboard.');
        await scrapePharmacies();
        global.syncBotState.success();
    } catch (error) {
        global.syncBotState.failed(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Bot Dashboard API Server is running on http://localhost:${PORT}`);
});