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
  
  const scraper = spawn('node', ['scripts/fetch_allsvenskan_api.js', '--all'], {
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

function shouldScrapeLive() {
  const now = Date.now();
  
  // 1. Read Allsvenskan matches
  try {
    const allsvenskanPath = path.join(process.cwd(), 'public/data/allsvenskan_matches.json');
    if (fs.existsSync(allsvenskanPath)) {
      const data = JSON.parse(fs.readFileSync(allsvenskanPath, 'utf8'));
      const matches = data.matches || [];
      for (const m of matches) {
        if (m.status === 'live' || m.status === 'LIVE') return true;
        if (m.startTimestamp) {
          const startMs = m.startTimestamp * 1000;
          // Check if match started less than 135 minutes ago, is not finished, and we are past start time
          if (now >= startMs - 2 * 60 * 1000 && now < startMs + 135 * 60 * 1000 && m.status !== 'finished') {
            return true;
          }
        }
      }
    }
  } catch {}

  // 2. Read VM matches
  try {
    const fifaPath = path.join(process.cwd(), 'public/data/fifa_matches.json');
    if (fs.existsSync(fifaPath)) {
      const data = JSON.parse(fs.readFileSync(fifaPath, 'utf8'));
      const matches = data.matches || [];
      for (const m of matches) {
        if (m.status === 'live' || m.status === 'LIVE') return true;
        if (m.startTimestamp) {
          const startMs = m.startTimestamp * 1000;
          if (now >= startMs - 2 * 60 * 1000 && now < startMs + 135 * 60 * 1000 && m.status !== 'finished') {
            return true;
          }
        }
      }
    }
  } catch {}

  return false;
}

let isLiveScraping = false;

async function runLiveScrape() {
  if (isLiveScraping) return;
  isLiveScraping = true;
  
  log('⚡ Active live match detected! Starting live match scrape for real-time updates...');
  
  try {
    // Run Allsvenskan matches scraper
    await new Promise((resolve) => {
      log('  Running fetch_allsvenskan_api.js --matches...');
      const p1 = spawn('node', ['scripts/fetch_allsvenskan_api.js', '--matches'], { cwd: process.cwd() });
      p1.on('close', resolve);
    });
    
    // Run FIFA matches scraper
    await new Promise((resolve) => {
      log('  Running scrape_fifa.js...');
      const p2 = spawn('node', ['scripts/scrape_fifa.js'], { cwd: process.cwd() });
      p2.on('close', resolve);
    });
    
    log('✓ Live match scrape completed successfully');
  } catch (e) {
    log(`✗ Live match scrape failed: ${e.message}`);
  } finally {
    isLiveScraping = false;
  }
}

// Schedule daily complete scrape at 06:00
cron.schedule('0 6 * * *', () => {
  runScraper();
});

// Check for live matches every 60 seconds
setInterval(() => {
  if (shouldScrapeLive()) {
    runLiveScrape();
  }
}, 60000);

log('📅 Daily scheduler and real-time live scraper started successfully!');
log('- Daily complete scrape scheduled for 06:00');
log('- Active matches will be scraped every minute automatically');

// Keep process alive
setInterval(() => {}, 10000);
