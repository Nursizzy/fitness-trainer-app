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
    if (!initDataString) return null;

    try {
        // Parse the query string
        const urlParams = new URLSearchParams(initDataString);
        const hash = urlParams.get('hash');

        if (!hash) return null;

        // Remove hash from the data to check
        urlParams.delete('hash');

        // Sort the params by key
        const params = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Create data check hash
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.TELEGRAM_BOT_TOKEN)
            .digest();

        const dataCheckString = crypto.createHmac('sha256', secretKey)
            .update(params)
            .digest('hex');

        // Verify the hash
        if (dataCheckString !== hash) {
            return null;
        }

        // Parse user data
        const userData = JSON.parse(urlParams.get('user') || '{}');
        return userData;
    } catch (error) {
        console.error('Telegram validation error:', error);
        return null;
    }
}

module.exports = validateTelegramWebAppData;