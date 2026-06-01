# 🏥 Automated On-Duty Pharmacies Scraping Bot (Salé, Morocco)

An automated, Production-grade backend Node.js microservice designed to perform daily scheduling, web scraping, and active content delivery. The system visits target pharmaceutical indexing registries, identifies current on-duty emergency pharmacies matching today's dynamic French date patterns, structures the dataset, compiles a stylized native Excel ledger, and pushes it directly into your Telegram communication thread.

---

## 🚀 Key Features

* **Dynamic Headless Scraping:** Leverages Microsoft Playwright to interactively parse asynchronous raw table DOM layouts without blowing up overhead memory.
* **Intelligent Date Alignment:** Automated calculation engine matching local execution timelines against complex localized regional date nodes (e.g., `lundi 01 juin 2026`).
* **Production-Grade Asset Generation:** Transforms bare array data objects into clean, production-styled native spreadsheets featuring brand-aligned custom theme coloring and auto-fitted data padding structures.
* **Reliable Autonomous Execution:** Built with robust background scheduling engines designed to fire off payloads exactly at 20:00 (8:00 PM) strictly respecting Moroccan Timezones (`Africa/Casablanca`).
* **Automated Cleanups:** Instantly drops binary memory and sweeps disk space by deleting local temporary reports as soon as the API broadcast confirms a successful handshake.

---

## 🛠️ Stack & Technologies Used

The architecture relies entirely on lightweight, enterprise-vetted packages running on a single runtime lifecycle:

| Technology / Library | Layer Purpose | Technical Reason for Use |
| :--- | :--- | :--- |
| **Node.js (v20+)** | Runtime Environment | Asynchronous event-driven JavaScript engine suited for background microservices. |
| **Playwright (Chromium)** | Data Collection Layer | High-level automation API to control headless browsers, bypass rigid layout architectures, and dynamically clean DOM elements. |
| **Node-Cron** | Task Orchestration / Scheduler | Pure JavaScript implementation of the tiny-crontab system, guaranteeing down-to-the-minute thread execution without native OS crontab dependencies. |
| **Node-Fetch** | Network Delivery Layer | Promise-based HTTP client to safely package binary FormData streams over remote Telegram API gateways. |

---

## ⚙️ Project Prerequisites

Before spinning up the application, ensure your environment has:
1. **Node.js LTS (v20.x or higher)** installed.
2. A Telegram account with an initialized Telegram Bot token (generated via `@BotFather`).
3. Your personal Telegram Account Chat ID (retrieved via `@userinfobot`).

---

## 📦 Installation & Setup

1. **Clone or navigate into your workspace:**
   ```bash
   cd /path/to/your/automation-folder
