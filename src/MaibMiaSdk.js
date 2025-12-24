/**
 * Node.js SDK for maib MIA API
 * Main Class
 */

const { SANDBOX_BASE_URL, PRODUCTION_BASE_URL } = require('./constants');
const { validateCallbackSignature } = require('./utils');

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
     * Validate callback signature from maib MIA
     * @param {Object} callbackData - The callback data received from maib
     * @param {string} signatureKey - The signature key for validation
     * @returns {boolean} - True if signature is valid, false otherwise
     */
    static validateCallbackSignature(callbackData, signatureKey) {
        return validateCallbackSignature(callbackData, signatureKey);
    }

    /**
     * Check if running in sandbox mode
     * @param {string} baseUrl - Base URL being used
     * @returns {boolean} - True if sandbox mode
     */
    static isSandbox(baseUrl) {
        return baseUrl === SANDBOX_BASE_URL;
    }

    /**
     * Check if running in production mode
     * @param {string} baseUrl - Base URL being used
     * @returns {boolean} - True if production mode
     */
    static isProduction(baseUrl) {
        return baseUrl === PRODUCTION_BASE_URL;
    }
}

module.exports = MaibMiaSdk;
