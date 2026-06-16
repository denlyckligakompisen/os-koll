const fs = require('fs');
const path = require('path');

const matchCardPath = path.join(__dirname, '..', 'src', 'components', 'MatchCard.jsx');
let content = fs.readFileSync(matchCardPath, 'utf-8');

const newImports = `
import TeamLogo from './MatchCard/TeamLogo';
import BroadcasterLogo from './MatchCard/BroadcasterLogo';
import EventsTimeline from './MatchCard/EventsTimeline';
import LineupsSection from './MatchCard/LineupsSection';
import { parseMatchDateLocal, cleanTeamName, formatLiveTime } from './MatchCard/utils';
`;

// Replace from const TeamLogo to just before const MatchCard
const startIndex = content.indexOf('const TeamLogo = ');
const endIndex = content.indexOf('const MatchCard = ');

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex);
    const after = content.slice(endIndex);
    fs.writeFileSync(matchCardPath, before + newImports + '\n' + after, 'utf-8');
    console.log('Successfully refactored MatchCard.jsx');
} else {
    console.error('Could not find startIndex or endIndex in MatchCard.jsx');
}
