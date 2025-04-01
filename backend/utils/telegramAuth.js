const crypto = require('crypto');

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

        // Use timing-safe comparison to prevent timing attacks
        // Convert both hashes to buffers of same length
        const calculatedHashBuffer = Buffer.from(dataCheckString, 'hex');
        const receivedHashBuffer = Buffer.from(hash, 'hex');

        // Only compare if lengths match to avoid errors
        let hashesMatch = calculatedHashBuffer.length === receivedHashBuffer.length;
        if (hashesMatch) {
            try {
                hashesMatch = crypto.timingSafeEqual(calculatedHashBuffer, receivedHashBuffer);
            } catch (e) {
                console.error('Error in timing-safe comparison:', e);
                hashesMatch = false;
            }
        }

        if (!hashesMatch) {
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
