/**
 * Node.js SDK for maib MIA API
 * Main Class
 */

const crypto = require('crypto');

const { SANDBOX_BASE_URL, PRODUCTION_BASE_URL } = require('./constants');

class MaibMiaSdk {
    /**
     * Sandbox base URL
     */
    static get SANDBOX_BASE_URL() {
        return SANDBOX_BASE_URL;
    }

    /**
     * Production base URL
     */
    static get PRODUCTION_BASE_URL() {
        return PRODUCTION_BASE_URL;
    }

    /**
     * Validate callback data signature
     * @param {Object} callbackData - The callback data received from the payment gateway
     * @param {string} signatureKey - The signature key for validation
     * @returns {boolean} - True if signature is valid, false otherwise
     * @link https://docs.maibmerchants.md/mia-qr-api/en/notifications-on-callback-url
     * @link https://docs.maibmerchants.md/mia-qr-api/en/examples/signature-key-verification
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/callback-notifications#signature-validation
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/examples/signature-key-verification
     */
    static validateCallbackSignature(callbackData, signatureKey) {
        if (!signatureKey) {
            throw new Error('Invalid signature key');
        }

        const callbackSignature = callbackData.signature || '';
        const callbackResult = callbackData.result || {};

        if (!callbackSignature || !callbackResult) {
            throw new Error('Missing result or signature in callback data.');
        }

        const keys = {};

        // Collect and format values
        for (const [key, value] of Object.entries(callbackResult)) {
            if (value === null || value === undefined) continue;

            let valueStr;
            if (key === 'amount' || key === 'commission') {
                valueStr = parseFloat(value).toFixed(2); // Always two decimals
            } else {
                valueStr = String(value);
            }

            if (valueStr.trim() !== '') {
                keys[key] = valueStr;
            }
        }

        // Sort keys case-insensitively
        const orderedKeys = Object.keys(keys).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );

        // Join values with colon
        const additionalString = orderedKeys.map(k => keys[k]).join(':');
        const hashInput = `${additionalString}:${signatureKey}`;

        // Hash and base64 encode
        const hash = crypto.createHash('sha256').update(hashInput, 'utf8').digest('base64');

        // Compare with expected signature
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(callbackSignature));
    }
}

module.exports = MaibMiaSdk;
