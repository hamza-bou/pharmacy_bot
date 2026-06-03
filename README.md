# 🏥 Automated On-Duty Pharmacies Scraping & AI Broadcast Bot (Salé, Morocco)

An automated, production-grade Node.js backend microservice designed to perform daily scheduling, web scraping, AI content synthesis, and active social delivery. The system monitors pharmaceutical indexing registries, extracts current on-duty emergency pharmacies matching today's dynamic French date patterns, structures the dataset, leverages Google Gemini LLM to rewrite the data into an elegant Arabic bulletin layout, and broadcasts it directly over a Telegram communication gateway.

---

## 🚀 Key Features

* **Dynamic Headless Scraping:** Leverages Microsoft Playwright to interactively parse asynchronous raw table DOM layouts without blowing up overhead memory.
* **Google Gemini AI Optimization:** Integrates the `@google/genai` SDK (`gemini-2.5-flash` with a graceful auto-switch to `gemini-1.5-flash` under high demand) to dynamically convert bare JSON objects into beautifully formatted, emoji-rich Arabic community reports.
* **Strict HTML Formatting Enforcement:** Automatically sanitizes synthesized text against restrictive Telegram HTML styling requirements to guarantee safe deliverability without parsing anomalies.
* **Fault-Tolerant Fail-safe Infrastructure (Fallback):** If AI endpoints encounter rate limits or platform outtages, the microservice gracefully reverts to compiling a hard backup `.json` raw document payload and dispatches it directly over the stream.
* **Environment Separation:** Strict isolation of programmatic logic from infrastructure variables using `.env` to prevent accidental public credential exposures.
* **Autonomous Cron Lifecycle:** Controlled orchestration firing exactly at 20:00 (8:00 PM) matching Casablanca/Moroccan Timezone specifications (`Africa/Casablanca`).

---

## 🛠️ Stack & Technologies Used

The architecture relies entirely on lightweight, asynchronous packages optimized to run within a single microservice lifecycle:

| Technology / Library | Layer Purpose | Technical Reason for Use |
| :--- | :--- | :--- |
| **Node.js (v20+)** | Runtime Environment | Asynchronous event-driven JavaScript engine suited for background microservices. |
| **Playwright (Chromium)** | Data Collection Layer | High-level automation API to control headless browsers, bypass rigid layout architectures, and dynamically extract DOM element states. |
| **Google GenAI SDK** | AI Synthesis Layer | Official modern client for interacting with Google's high-speed LLM architectures (`gemini-2.5-flash`) for localized text rewriting. |
| **Node-Cron** | Task Orchestration | Pure JavaScript implementation of the crontab system, guaranteeing down-to-the-minute execution without native OS daemon dependencies. |
| **Dotenv** | Configuration Security | Loads sensitive operational profiles cleanly into application execution threads (`process.env`) outside version control pipelines. |
| **Node-Fetch** | Network Delivery Layer | Promise-based HTTP client to stream messages or JSON file binary buffers safely over secure remote Telegram API gateways. |

---

## ⚙️ Project Prerequisites

Before spinning up the application, ensure your workspace environment contains:
1. **Node.js LTS (v20.x or higher)**.
2. A dedicated Telegram Bot Token (generated via `@BotFather`).
3. An active Target Audience Identifier (Your profile `CHAT_ID`, or a public/private channel identifier like `@YourChannelName`).
4. A Google Gemini API Key (generated via the [Google AI Studio](https://aistudio.google.com/)).

---

## 📦 Installation & Setup

### 1. Clone & Install Dependencies
Navigate into your workspace directory and run:
```bash
cd /path/to/your/automation-folder
npm install
