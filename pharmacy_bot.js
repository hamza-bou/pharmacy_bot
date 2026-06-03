const { chromium } = require('playwright');
const fs = require('fs');
const cron = require('node-cron');
const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function reportProgress(message) {
    console.log(message); 
    if (global.syncBotState && typeof global.syncBotState.log === 'function') {
        global.syncBotState.log(message); 
    }
}

function getFrenchTodayDate() {
    const today = new Date();
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const dayName = days[today.getDay()];
    const dayNumber = String(today.getDate()).padStart(2, '0');
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    
    return {
        standard: `${dayNumber}/${String(today.getMonth() + 1).padStart(2, '0')}/${year}`,
        frenchPattern: `${dayName} ${dayNumber} ${monthName} ${year}`
    };
}

async function generateSummaryWithAI(pharmaciesList, dateStr) {
    reportProgress('🤖 Sending data to Google Gemini for AI optimization...');
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            config: {
                systemInstruction: `You are an assistant for a local community Telegram channel in Salé, Morocco. 
                Your job is to read a JSON array of on-duty pharmacies and rewrite it into a highly professional, beautifully formatted, easy-to-read bulletin report in Arabic.
                Use appropriate emojis (🏥, 📍, 📞, 🌟). Sort them or format them so a normal citizen can read them immediately on their phone screen. 
                Do not change the phone numbers or the names of the pharmacies.
                
                CRITICAL HTML RULES FOR TELEGRAM:
                - Use ONLY <b>text</b> for bold text and <i>text</i> for italics.
                - Never use markdown symbols like * or _.
                - NEVER use block tags like <p>, </p>, <div>, <span>, or <br/>.
                - To make a new line, just hit Enter/Return naturally in your plain text output.`
            },
            contents: `Here is the list of on-duty pharmacies for today (${dateStr}): ${JSON.stringify(pharmaciesList)}`,
        });

        let aiText = response.text;
        if (aiText) {
            aiText = aiText.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n');
        }
        return aiText;
    } catch (error) {
        reportProgress(`❌ Gemini API Error: ${error.message}`);
        return null;
    }
}

async function scrapePharmacies() {
    reportProgress('🔄 Starting web scraping for today\'s on-duty pharmacies...');
    const browser = await chromium.launch({ headless: true }); 
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.guidepharmacies.ma/pharmacies-de-garde/sale.html', { waitUntil: 'networkidle' });

        const dateInfo = getFrenchTodayDate();
        reportProgress(`📅 Searching for today's date on the website: ${dateInfo.frenchPattern}`);
        
        const pharmaciesToday = await page.evaluate((targetDatePattern) => {
            const rows = document.querySelectorAll('table tr');
            let result = [];
            let isTodaySection = false;

            rows.forEach(row => {
                const dateCell = row.querySelector('td.tableh2');
                if (dateCell) {
                    const dateText = dateCell.innerText.replace(/\s+/g, ' ').trim().toLowerCase();
                    const cleanTargetPattern = targetDatePattern.replace(/\s+/g, ' ').trim().toLowerCase();
                    
                    if (dateText.includes(cleanTargetPattern)) {
                        isTodaySection = true;
                    } else {
                        isTodaySection = false; 
                    }
                }

                if (isTodaySection) {
                    const dataCell = row.querySelector('td.tableb');
                    if (dataCell) {
                        const eventDesc = dataCell.querySelector('div.eventdesc');
                        if (eventDesc) {
                            let neighborhood = eventDesc.querySelector('p.location-name')?.innerText?.trim() || 'Unspecified';
                            neighborhood = neighborhood.replace(/\s+/g, ' '); 

                            const linkElement = eventDesc.querySelector('h4 a');
                            const fullText = linkElement ? linkElement.innerText.replace(/\s+/g, ' ').trim() : '';
                            
                            let pharmacyName = fullText;
                            let phoneNumber = 'Not Available';
                            
                            if (fullText.includes('-')) {
                                const parts = fullText.split('-');
                                pharmacyName = parts[0].trim();
                                phoneNumber = parts[1].trim();
                            }

                            result.push({
                                pharmacy: pharmacyName,
                                phone: phoneNumber,
                                neighborhood: neighborhood
                            });
                        }
                    }
                }
            });

            return result;
        }, dateInfo.frenchPattern);

        if (pharmaciesToday.length === 0) {
            reportProgress('⚠️ No pharmacies found for today\'s date.');
            return;
        }

        reportProgress(`✅ Successfully extracted ${pharmaciesToday.length} pharmacies.`);
        
        const aiSummaryMessage = await generateSummaryWithAI(pharmaciesToday, dateInfo.standard);
        
        if (aiSummaryMessage) {
            await sendTextMessageToTelegram(aiSummaryMessage);
        } else {
            reportProgress('⚠️ AI generation failed, falling back to JSON backup file...');
            const fileName = `pharmacies_today_sale.json`;
            fs.writeFileSync(fileName, JSON.stringify(pharmaciesToday, null, 2));
            await sendFileToTelegram(fileName, dateInfo.standard);
        }

    } catch (error) {
        throw error;
    } finally {
        await browser.close();
    }
}

async function sendTextMessageToTelegram(textMessage) {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const cleanMessage = textMessage.trim();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: cleanMessage,
                parse_mode: 'HTML' 
            })
        });
        const result = await response.json();
        if (result.ok) {
            reportProgress('🚀 Gemini AI Summary report sent to Telegram successfully!');
        } else {
            reportProgress(`❌ Failed to send text to Telegram: ${result.description}`);
        }
    } catch (err) {
        reportProgress(`❌ Telegram API error: ${err.message}`);
    }
}

async function sendFileToTelegram(filePath, dateStr) {
    const fetch = (await import('node-fetch')).default;
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/json' });
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('caption', `🏥 On-duty pharmacies for Salé today (${dateStr}):`);
    form.append('document', fileBlob, filePath);

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
    try {
        const response = await fetch(url, { method: 'POST', body: form });
        const result = await response.json();
        if (result.ok) {
            reportProgress('🚀 Backup file sent successfully!');
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        reportProgress(`❌ File upload error: ${err.message}`);
    }
}

cron.schedule('00 20 * * *', async () => {
    if (global.syncBotState) {
        try {
            global.syncBotState.start('⏰ Automated Scheduled Cron run initiated (20:00 Casablanca Time).');
            await scrapePharmacies();
            global.syncBotState.success();
        } catch (error) {
            global.syncBotState.failed(error.message);
        }
    } else {
        console.log('⏰ Standard isolated cron run triggered.');
        scrapePharmacies().catch(console.error);
    }
}, {
    scheduled: true,
    timezone: "Africa/Casablanca"
});

module.exports = { scrapePharmacies };