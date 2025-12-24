/**
 * Node.js SDK for maib MIA API
 * Main Class
 */

const crypto = require('crypto');
const axios = require('axios');

const { SANDBOX_BASE_URL, DEFAULT_BASE_URL, DEFAULT_TIMEOUT } = require('./constants');

class MaibMiaSdk {
    /**
     * Create a new MaibMiaSdk instance
     * @param {string} baseUrl - maib MIA API base url
     * @param {number} timeout - API request timeout in milliseconds
     */
    constructor(baseUrl = DEFAULT_BASE_URL, timeout = DEFAULT_TIMEOUT) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;

        this.client = axios.create({
            baseURL: baseUrl,
            timeout: timeout
        });
    }

    /**
     * Sandbox base URL
     */
    static get SANDBOX_BASE_URL() {
        return SANDBOX_BASE_URL;
    }

    /**
     * Production base URL
     */
    static get DEFAULT_BASE_URL() {
        return DEFAULT_BASE_URL;
    }

    /**
     * Default API request timeout in milliseconds
     */
    static get DEFAULT_TIMEOUT() {
        return DEFAULT_TIMEOUT;
    }

    /**
     * Perform API request
     * @param {string} method - Request HTTP method
     * @param {string} url - Request URL
     * @param {Object} data - Request data
     * @param {Object} params - Request params
     * @param {string} token - Access token
     * @returns {Promise<Object>} API request response
     */
    async _sendRequest(method, url, data=null, params=null, token=null) {
        const requestConfig = {
            url: url,
            method: method,
            data: data,
            headers: MaibMiaSdk._getAuthHeaders(token),
            params: params
        }

        const response = await this.client.request(requestConfig);
        return MaibMiaSdk._handleResponse(response);
    }

    /**
     * Set authorization header
     * @param {string} token - Access token
     * @returns {Object} - Headers object
     */
    static _getAuthHeaders(token) {
        if (!token) return null;

        return {
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Handles errors returned by the API
     * @param {axios.AxiosResponse} response - Response object
     * @param {string} endpoint - API endpoint
     */
    static _handleResponse(response, endpoint) {
        if (!response.data)
            throw new Error(`Invalid response received from server for endpoint ${endpoint}`);

        if (response.data.ok) {
            if (response.data.result)
                return response.data.result;

            throw new Error(`Invalid response received from server for endpoint ${endpoint}: missing 'result' field.`);
        }

        if(response.errors) {
            const error = response.errors[0];
            throw new Error(`Error sending request to endpoint ${endpoint}: ${error.errorMessage} (${error.errorCode})`);
        }

        throw new Error(`Invalid response received from server for endpoint ${endpoint}: missing 'ok' and 'errors' fields`);
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
