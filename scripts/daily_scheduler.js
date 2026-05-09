import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'scraper_log.txt');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage);
}

function runScraper() {
  log('🔄 Starting daily scrape of Allsvenskan matches...');
  
  const scraper = spawn('npm', ['run', 'scrape:allsvenskan'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  scraper.stdout.on('data', (data) => {
    log(`  ${data.toString().trim()}`);
  });

  scraper.stderr.on('data', (data) => {
    log(`  ERROR: ${data.toString().trim()}`);
  });

  scraper.on('close', (code) => {
    if (code === 0) {
      log('✓ Scraper completed successfully');
    } else {
      log(`✗ Scraper failed with exit code ${code}`);
    }
  });
}

// Schedule to run every day at 06:00 (6 AM)
cron.schedule('0 6 * * *', () => {
  runScraper();
});

// Also run once at startup
log('📅 Daily scheduler started - will run at 06:00 every day');
runScraper();

// Keep process alive
setInterval(() => {
  // Silent
}, 1000);
