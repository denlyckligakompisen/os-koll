import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/exchange_rate.json');
const FALLBACK_RATE = 11.5;

/**
 * Fetches the current EUR->SEK exchange rate from a free, keyless API
 * and saves it to public/data/exchange_rate.json for the frontend to use.
 * Falls back to the last known rate (or a hardcoded default) on failure.
 */
export async function fetchAndSaveExchangeRate() {
    try {
        const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=SEK');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rate = data?.rates?.SEK;
        if (!rate || typeof rate !== 'number') throw new Error('Invalid response shape');

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
            base: 'EUR',
            target: 'SEK',
            rate,
            lastUpdated: new Date().toISOString(),
            source: 'frankfurter.dev'
        }, null, 2));

        console.log(`✓ EUR/SEK exchange rate updated: ${rate}`);
        return rate;
    } catch (e) {
        console.warn(`⚠ Failed to fetch exchange rate, keeping existing value: ${e.message}`);
        return FALLBACK_RATE;
    }
}
