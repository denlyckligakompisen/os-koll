const USER_REPO = 'denlyckligakompisen/os-koll';
const BRANCH = 'main';
const DATA_PATH = 'public/data';

const getFetchUrls = (path) => [
    `/data${path}`, // Local first for immediate testing
    `https://raw.githubusercontent.com/${USER_REPO}/${BRANCH}/${DATA_PATH}${path}?t=${new Date().getTime()}`,
    `https://cdn.jsdelivr.net/gh/${USER_REPO}@${BRANCH}/${DATA_PATH}${path}`,
];

const fetchWithFallback = async (path) => {
    const urls = getFetchUrls(path);
    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`Successfully fetched from: ${url}`);
                return await response.json();
            }
            // Only warn if we're not at the last resort
            if (url !== urls[urls.length - 1]) {
                console.warn(`Source failed (${url}), trying next...`);
            }
        } catch (error) {
            console.error(`Fetch from ${url} failed:`, error);
        }
    }
    return null;
};

export const fetchSokSchedule = async () => {
    const data = await fetchWithFallback('/sok_schedule.json');
    return data || [];
};

export const fetchMedals = async () => {
    const data = await fetchWithFallback('/medals.json');
    return data || { gold: 0, silver: 0, bronze: 0 };
};

export const fetchSvtSchedule = async () => {
    const data = await fetchWithFallback('/svt_schedule.json');
    return data || [];
};
