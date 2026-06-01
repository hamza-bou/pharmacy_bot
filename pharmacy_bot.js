const { chromium } = require('playwright');
const fs = require('fs');
const cron = require('node-cron');

//Place your Telegram configuration here
const TELEGRAM_TOKEN = '8153180271:AAHx-LdWP8--2oYrDWlxnV1rvD6jKMZA248';
const CHAT_ID = '1447383528';

// Function to convert the current date to the French format used by the website (e.g., "lundi 01 juin 2026")
function getFrenchTodayDate() {
    const today = new Date();
    
    // Array of weekdays in French
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    // Array of months in French
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

async function scrapePharmacies() {
    console.log('🔄 Starting web scraping for today\'s on-duty pharmacies...');
    const browser = await chromium.launch({ headless: true }); 
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.guidepharmacies.ma/pharmacies-de-garde/sale.html', { waitUntil: 'networkidle' });

        const dateInfo = getFrenchTodayDate();
        console.log(`📅 Searching for today's date on the website: ${dateInfo.frenchPattern}`);
        
        const pharmaciesToday = await page.evaluate((targetDatePattern) => {
            const rows = document.querySelectorAll('table tr');
            let result = [];
            let isTodaySection = false;

            rows.forEach(row => {
                // 1. Check and search for the date cell
                const dateCell = row.querySelector('td.tableh2');
                if (dateCell) {
                    // Clean text from extra spaces, hidden characters, and normalize to lowercase
                    const dateText = dateCell.innerText.replace(/\s+/g, ' ').trim().toLowerCase();
                    const cleanTargetPattern = targetDatePattern.replace(/\s+/g, ' ').trim().toLowerCase();
                    
                    if (dateText.includes(cleanTargetPattern)) {
                        isTodaySection = true;
                    } else {
                        isTodaySection = false; // Stop collecting if it moves to a different date section
                    }
                }

                // 2. Extract data if inside today's target section
                if (isTodaySection) {
                    const dataCell = row.querySelector('td.tableb');
                    if (dataCell) {
                        const eventDesc = dataCell.querySelector('div.eventdesc');
                        if (eventDesc) {
                            // Extract neighborhood from p.location-name and clean up whitespace
                            let neighborhood = eventDesc.querySelector('p.location-name')?.innerText?.trim() || 'Unspecified';
                            neighborhood = neighborhood.replace(/\s+/g, ' '); 

                            // Extract pharmacy name and phone number from within h4 a
                            const linkElement = eventDesc.querySelector('h4 a');
                            const fullText = linkElement ? linkElement.innerText.replace(/\s+/g, ' ').trim() : '';
                            
                            let pharmacyName = fullText;
                            let phoneNumber = 'Not Available';
                            
                            // Split the pharmacy name and phone number using the "-" separator
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
            console.log('⚠️ No pharmacies found for today\'s date. The website might not be updated yet.');
            return;
        }

        // Save the structured results to a JSON file
        const fileName = `pharmacies_today_sale.json`;
        fs.writeFileSync(fileName, JSON.stringify(pharmaciesToday, null, 2));
        console.log(`✅ Successfully extracted ${pharmaciesToday.length} pharmacies.`);
        
        // Send the generated file to Telegram
        await sendFileToTelegram(fileName, dateInfo.standard);

    } catch (error) {
        console.error('❌ An error occurred during scraping:', error);
    } finally {
        await browser.close();
    }
}

async function sendFileToTelegram(filePath, dateStr) {
    const fetch = (await import('node-fetch')).default;
    
    // Read the local file buffer and transform it into a standard Blob payload
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/json' });
    
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('caption', `🏥 On-duty pharmacies for Salé today (${dateStr}):`);
    form.append('document', fileBlob, filePath); // Pass the Blob payload along with the filename

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
    
    try {
        const response = await fetch(url, { method: 'POST', body: form });
        const result = await response.json();
        if (result.ok) {
            console.log('🚀 Updated file sent to Telegram successfully!');
            fs.unlinkSync(filePath); // Delete local file after a successful transmission
        } else {
            console.error('❌ Failed to send file to Telegram:', result.description);
        }
    } catch (err) {
        console.error('❌ Telegram API communication error:', err);
    }
}

// Cron scheduler: Runs daily at 20:00 (8:00 PM) Moroccan Time
cron.schedule('0 20 * * *', () => {
    scrapePharmacies();
}, {
    scheduled: true,
    timezone: "Africa/Casablanca"
});

// Immediate execution call for testing and validating selectors on startup
scrapePharmacies();