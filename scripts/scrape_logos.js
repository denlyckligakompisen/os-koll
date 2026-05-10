
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { normalizeTeamName, getTeamFileSlug } from './constants.js';

const LOGO_DIR = path.join(process.cwd(), 'public/logos');
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

async function downloadImage(url, filepath) {
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
    });
}

async function scrapeOfficialLogos() {
    const standingsFiles = [
        'public/data/allsvenskan_standings.json',
        'public/data/sirius_standings.json'
    ];

    const teams = new Map(); // Name -> ID

    for (const file of standingsFiles) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            data.forEach(t => {
                if (t.id) {
                    const normalized = normalizeTeamName(t.team);
                    teams.set(normalized, t.id);
                }
            });
        }
    }

    console.log(`Downloading logos for ${teams.size} teams...`);

    for (const [name, id] of teams.entries()) {
        const url = `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
        const slug = getTeamFileSlug(name);
        const filename = `${slug}.png`;
        const filepath = path.join(LOGO_DIR, filename);

        // Skip downloading if the logo already exists and is not empty
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
            console.log(`Using cached logo for ${name} -> ${filename}`);
            continue;
        }

        try {
            await downloadImage(url, filepath);
            console.log(`Downloaded ${name} -> ${filename}`);
            
            // Polite delay after successful download
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
            console.error(`Failed to download ${name}: ${e.message}`);
            // Polite delay on error
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        }
    }
}

scrapeOfficialLogos();
