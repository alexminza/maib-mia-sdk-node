/**
 * Node.js SDK for maib MIA API
 * Utility Functions
 */

const crypto = require('crypto');

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
function validateCallbackSignature(callbackData, signatureKey) {
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

/**
 * Replace path parameters in URL
 * @param {string} path - URL path with parameters
 * @param {Object} params - Parameters to replace
 * @returns {string} - Path with replaced parameters
 */
function replacePath(path, params) {
    let result = path;

    for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, value);
    }

    return result;
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @throws {Error} - If any required field is missing
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field =>
        data[field] === undefined || data[field] === null
    );

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
}

/**
 * Format date to ISO 8601 string
 * @param {Date|string} date - Date to format
 * @returns {string} - ISO formatted date string
 */
function formatDate(date) {
    if (date instanceof Date) {
        return date.toISOString();
    }

    if (typeof date === 'string') {
        return new Date(date).toISOString();
    }

    throw new Error('Invalid date format');
}

/**
 * Create error object with details
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} - Error object with details
 */
function createError(message, details = {}) {
    const error = new Error(message);
    error.details = details;
    return error;
}

module.exports = {
    validateCallbackSignature,
    replacePath,
    validateRequiredFields,
    formatDate,
    createError
};