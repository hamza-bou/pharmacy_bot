# 🏥 Automated Pharmacy Scraper & AI Summarizer Dashboard

A modern, full-stack automation system that automatically scrapes on-duty pharmacy schedules for **Salé, Morocco**, leverages **Google Gemini AI** to optimize the output into beautiful Arabic bulletins, dispatches real-time updates to a **Telegram Channel**, and provides an elegant **Web Control Dashboard** with live-streaming terminal log feeds.

---

## 🏗️ System Architecture



The project is engineered as a unified decoupled microservice architecture:
1. **Automation Core (`pharmacy_bot.js`)**: Orchestrates browser actions and scheduled jobs.
2. **Web API Middleware (`server.js`)**: An Express.js layer managing global system state metrics and live console streams.
3. **Control Panel (`public/index.html`)**: A responsive UI dashboard tracking automated cron lifecycles.

---

## 🌟 Core Features

* **Automated Web Scraping**: Powered by **Playwright (Headless Chromium)** to bypass static layouts and parse late-night on-duty shifts directly from local health listings.
* **Gemini 2.5 Flash AI Synthesis**: Contextual ingestion of raw structural data payloads into highly polished, localized Arabic copy tailored with semantic emojis for consumer channels.
* **Dual-Trigger Mechanics**: Run fully hands-free via a centralized background **Node-Cron runner (Daily at 20:05 Casablanca Time)** or execute manual forced dispatches instantly from the frontend.
* **Live Reactive Streaming Console**: Captures operational runtime exceptions and success updates, piping terminal metrics to the UI viewport using short-polling streams (`setInterval`).
* **Fault-Tolerant Failbacks**: Automatically compiles structural JSON backups and ships system raw attachments via Telegram if third-party AI endpoints face transient network congestion.

---

## 🛠️ Tech Stack & Tools

* **Frontend**: HTML5, JavaScript (ES6+ Vanilla Fetch API), Tailwind CSS (CDN Blueprint layout).
* **Backend Node Runtime**: Node.js, Express.js.
* **Automation Engine**: Playwright Core.
* **Artificial Intelligence**: `@google/genai` (Gemini 2.5 Flash API).
* **Task Scheduling**: `node-cron`.
* **Notification Integration**: Telegram Bot API (Native `node-fetch` multipart streams).

---

## 📁 Directory Structure

```text
your-project/
├── public/
│   └── index.html         # Tailwind CSS Dashboard & Fetch polling script
├── .env                   # Protected Infrastructure Credentials (API Keys, Chat IDs)
├── pharmacy_bot.js        # Playwright scraper, Gemini processing, and daily Cron
├── server.js              # Express Web API server & global log orchestration bridge
├── package.json           # Application dependencies
└── README.md              # Project documentation
