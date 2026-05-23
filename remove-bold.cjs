const fs = require('fs'); 
const files = ['src/index.css', 'src/components/AllsvenskanKollen.jsx', 'src/components/MatchCard.jsx', 'src/components/VMBracket.jsx']; 
files.forEach(f => { 
    if (!fs.existsSync(f)) return; 
    let text = fs.readFileSync(f, 'utf8'); 
    text = text.replace(/font-weight:\s*[^;]+;/g, 'font-weight: 400;'); 
    text = text.replace(/fontWeight:\s*[^,}]+/g, "fontWeight: '400'"); 
    fs.writeFileSync(f, text); 
    console.log('Updated ' + f); 
});
