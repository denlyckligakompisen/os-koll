/**
 * Security Utility: Sanitize scraped string data to prevent XSS/Data Poisoning
 * Use this on any text scraped from third party websites before saving to JSON.
 */
export function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return sanitize(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(obj)) {
            // We sanitize both the key and the value just to be completely safe
            sanitizedObj[sanitize(key)] = sanitizeObject(value);
        }
        return sanitizedObj;
    }
    return obj;
}
