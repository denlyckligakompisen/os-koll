import fs from 'fs';
import path from 'path';

const matchesPath = path.join(process.cwd(), 'public/data/worldcup_2026_matches.json');
const matchesData = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));

const tv4Links = [
    {"text":"Mexiko - Sydafrika","href":"https://www.tv4play.se/program/e99c23f01724d859eba7/mexiko-sydafrika"},
    {"text":"Sydkorea - Tjeckien","href":"https://www.tv4play.se/program/753771d380b9abff8192/sydkorea-tjeckien"},
    {"text":"USA - Paraguay","href":"https://www.tv4play.se/program/34f4a8ead25dbd9c5bd0/usa-paraguay"},
    {"text":"Qatar - Schweiz","href":"https://www.tv4play.se/program/b2c5c5a4403862c85e74/qatar-schweiz"},
    {"text":"Australien - Turkiet","href":"https://www.tv4play.se/program/de420ebee676a1a42bfa/australien-turkiet"},
    {"text":"Tyskland - Curaçao","href":"https://www.tv4play.se/program/12b55de12a9f9f772071/tyskland-curacao"},
    {"text":"Nederländerna - Japan","href":"https://www.tv4play.se/program/6d03c152724e28822785/nederlanderna-japan"},
    {"text":"Elfenbenskusten - Ecuador","href":"https://www.tv4play.se/program/8f4c9f930a3d8d2068b6/elfenbenskusten-ecuador"},
    {"text":"Saudiarabien - Uruguay","href":"https://www.tv4play.se/program/ed41228e324c54bcd127/saudiarabien-uruguay"},
    {"text":"Iran - Nya Zeeland","href":"https://www.tv4play.se/program/5772b537b5e0100a06e7/iran-nya-zeeland"},
    {"text":"Argentina - Algeriet","href":"https://www.tv4play.se/program/7cf65f3220a1554bc148/argentina-algeriet"},
    {"text":"Österrike - Jordanien","href":"https://www.tv4play.se/program/139ab09c57e1273734d1/osterrike-jordanien"},
    {"text":"Portugal - DR Kongo","href":"https://www.tv4play.se/program/4b14f3b2dd8ce4ca7072/portugal-dr-kongo"},
    {"text":"England - Kroatien","href":"https://www.tv4play.se/program/5c52c8515c6d6e02f5a5/england-kroatien"},
    {"text":"Irak - Norge","href":"https://www.tv4play.se/program/4945c29e0be423dad095/irak-norge"},
    {"text":"Ghana - Panama","href":"https://www.tv4play.se/program/370dce5520885c40f713/ghana-panama"},
    {"text":"Uzbekistan - Colombia","href":"https://www.tv4play.se/program/3a718e116ccaad7f32dc/uzbekistan-colombia"},
    {"text":"Tjeckien - Sydafrika","href":"https://www.tv4play.se/program/4bfab531a300ff5d993d/tjeckien-sydafrika"},
    {"text":"Schweiz - Bosnien","href":"https://www.tv4play.se/program/82c1b2be77f3e8b2678e/schweiz-bosnien"},
    {"text":"Kanada - Qatar","href":"https://www.tv4play.se/program/1efc6fd31a091777606e/kanada-qatar"},
    {"text":"Mexiko - Sydkorea","href":"https://www.tv4play.se/program/4775d30e867c83012768/mexiko-sydkorea"},
    {"text":"Brasilien - Haiti","href":"https://www.tv4play.se/program/b9c565d0b3c82ab4bfbb/brasilien-haiti"},
    {"text":"Turkiet - Paraguay","href":"https://www.tv4play.se/program/a7ed081fa4906ad8af51/turkiet-paraguay"},
    {"text":"Nederländerna - Sverige","href":"https://www.tv4play.se/program/80addba379a086dd8950/nederlanderna-sverige"},
    {"text":"Tyskland - Elfenbenskusten","href":"https://www.tv4play.se/program/7d47ac5c7db84b41e29c/tyskland-elfenbenskusten"},
    {"text":"Ecuador - Curaçao","href":"https://www.tv4play.se/program/dad4031e8a1570091aee/ecuador-curacao"},
    {"text":"Spanien - Saudiarabien","href":"https://www.tv4play.se/program/799c16d3f9238be0a5dd/spanien-saudiarabien"},
    {"text":"Belgien - Iran","href":"https://www.tv4play.se/program/128c12643284e9433ff2/belgien-iran"},
    {"text":"Uruguay - Kap Verde","href":"https://www.tv4play.se/program/61488ea64fbfb8597b6d/uruguay-kap-verde"},
    {"text":"Nya Zeeland - Egypten","href":"https://www.tv4play.se/program/9ec23b077a88fb570f39/nya-zeeland-egypten"},
    {"text":"Jordanien - Algeriet","href":"https://www.tv4play.se/program/14d20de4d1d64e74caf8/jordanien-algeriet"},
    {"text":"Panama - Kroatien","href":"https://www.tv4play.se/program/2feb64c9f32f741c471b/panama-kroatien"},
    {"text":"Colombia - DR Kongo","href":"https://www.tv4play.se/program/076d312b446072b177c5/colombia-dr-kongo"},
    {"text":"Schweiz - Kanada","href":"https://www.tv4play.se/program/fdf08229a287b4b8c7aa/schweiz-kanada"}
];

let updatedCount = 0;

matchesData.matches.forEach(match => {
    if (match.broadcast !== 'TV4') return;

    const matchLink = tv4Links.find(link => {
        const text = link.text.toLowerCase();
        const home = match.home.toLowerCase();
        const away = match.away.toLowerCase();
        
        // Exact match of both teams
        if (text.includes(home) && text.includes(away)) return true;
        
        // Handle some common differences
        if (home === 'turkiet' && text.includes('grekland')) return false; // Avoid mismatch
        
        return false;
    });

    if (matchLink) {
        match.link = matchLink.href;
        updatedCount++;
    }
});

fs.writeFileSync(matchesPath, JSON.stringify(matchesData, null, 2));
console.log(`Successfully updated ${updatedCount} matches with direct TV4 Play links.`);
