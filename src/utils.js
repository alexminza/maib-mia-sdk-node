/**
 * Node.js SDK for maib MIA API
 * Utility Functions
 */

const crypto = require('crypto');

/**
 * Validate callback signature from maib
 * @param {Object} callbackData - The callback data received from maib
 * @param {string} signatureKey - The signature key for validation
 * @returns {boolean} - True if signature is valid, false otherwise
 * @link https://docs.maibmerchants.md/mia-qr-api/en/examples/signature-key-verification
 */
function validateCallbackSignature(callbackData, signatureKey) {
    if (!callbackData || !callbackData.result || !callbackData.signature) {
        throw new Error('Invalid callback data structure');
    }

    if (!signatureKey) {
        throw new Error('Signature key is required');
    }

    // Create the message to sign from the result object
    const resultString = JSON.stringify(callbackData.result);

    // Calculate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', signatureKey);
    hmac.update(resultString);
    const calculatedSignature = hmac.digest('base64');

    return calculatedSignature === callbackData.signature;
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