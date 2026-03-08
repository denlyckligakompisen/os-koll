
import axios from 'axios';
async function run() {
    const res = await axios.get('https://www.fotmob.com/api/leagues?id=171', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const tables = res.data.table[0].data.tables;
    const group7 = tables.find(t => t.leagueName === 'Cup Grp. 7');
    group7.table.all.forEach(t => {
        console.log(`${t.name}: ${t.pts} pts, ${t.played} matches, ${t.goalConDiff} gd`);
    });
}
run();
