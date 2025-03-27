// Telegram authentication utility
const crypto = require('crypto');

/**
 * Validates initData received from Telegram Web App
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 *
 * @param {string} initDataString The initData query string from Telegram
 * @returns {object|null} The validated user data or null if validation fails
 */
function validateTelegramWebAppData(initDataString) {
    console.log('Raw initData:', initDataString);

    if (!initDataString) {
        console.error('No initData provided');
        return null;
    }

    try {
        // Parse the query string
        const urlParams = new URLSearchParams(initDataString);
        const hash = urlParams.get('hash');

        console.log('Extracted hash:', hash);

        if (!hash) {
            console.error('No hash found in initData');
            return null;
        }

        // Remove hash from the data to check
        urlParams.delete('hash');

        // Sort the params by key
        const params = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        console.log('Sorted params:', params);

        // Create data check hash
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.TELEGRAM_BOT_TOKEN)
            .digest();

        console.log('Secret key:', secretKey.toString('hex'));

        const dataCheckString = crypto.createHmac('sha256', secretKey)
            .update(params)
            .digest('hex');

        console.log('Calculated hash:', dataCheckString);
        console.log('Received hash:', hash);

        // Verify the hash
        if (dataCheckString !== hash) {
            console.error('Hash validation failed');
            return null;
        }

        // Parse user data
        const userData = JSON.parse(urlParams.get('user') || '{}');
        console.log('Parsed user data:', userData);

        return userData;
    } catch (error) {
        console.error('Telegram validation error:', error);
        return null;
    }
}

module.exports = validateTelegramWebAppData;