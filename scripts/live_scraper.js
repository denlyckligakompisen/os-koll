import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const SCRAPE_INTERVAL_MS = 60 * 1000; // 1 minut

const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_allsvenskan.js');
const dataPath = path.join(process.cwd(), 'public', 'data', 'allsvenskan_matches.json');

const MONTH_MAP = { 
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};

const parseDateLocal = (dateStr, timeStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date(0);
    
    const day = parseInt(parts[1]);
    const monthName = parts[2]?.toLowerCase();
    const year = parseInt(parts[3]) || 2026;

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, MONTH_MAP[monthName] ?? 0, day, hour, minute);
};

const runScraper = () => {
    const now = new Date();
    
    let shouldRun = false;

    if (fs.existsSync(dataPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            if (data && data.matches) {
                for (const match of data.matches) {
                    if (match.status === 'live') {
                        shouldRun = true;
                        break;
                    }

                    if (match.date && match.time && match.status !== 'finished') {
                        const matchStart = parseDateLocal(match.date, match.time);
                        const diffMinutes = (now - matchStart) / (1000 * 60);
                        
                        // Om matchen startade för mellan 0 och 130 minuter sedan
                        if (diffMinutes >= 0 && diffMinutes <= 130) {
                            shouldRun = true;
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Fel vid läsning av allsvenskan_matches.json", e);
        }
    }

    if (shouldRun) {
        console.log(`[${now.toLocaleTimeString()}] Match pågår! Startar skrapan...`);
        const proc = spawn('node', [scriptPath], { stdio: 'inherit' });
        proc.on('close', (code) => {
            console.log(`[${new Date().toLocaleTimeString()}] Skrapan klar (kod: ${code})`);
        });
    } else {
        console.log(`[${now.toLocaleTimeString()}] Ingen match pågår just nu. Väntar...`);
    }
};

console.log("--- LIVE SKRAPA STARTAD ---");
console.log(`Körs var ${SCRAPE_INTERVAL_MS / 1000}:e sekund, men BARA om en match spelas!`);

runScraper();
setInterval(runScraper, SCRAPE_INTERVAL_MS);
