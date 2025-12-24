/**
 * Node.js SDK for maib MIA API
 * Authentication Request Handler
 */

const axios = require('axios');
const { API_ENDPOINTS, DEFAULT_TIMEOUT } = require('./constants');
const { createError } = require('./utils');

class MaibMiaAuthRequest {
    /**
     * Create a new MaibMiaAuthRequest instance
     * @param {string} baseUrl - Base URL for the API
     * @param {number} timeout - Request timeout in milliseconds
     */
    constructor(baseUrl, timeout = DEFAULT_TIMEOUT) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: timeout
        });
    }

    /**
     * Static factory method to create an instance
     * @param {string} baseUrl - Base URL for the API
     * @param {number} timeout - Request timeout in milliseconds
     * @returns {MaibMiaAuthRequest}
     */
    static create(baseUrl, timeout = DEFAULT_TIMEOUT) {
        return new MaibMiaAuthRequest(baseUrl, timeout);
    }

    /**
     * Obtain Authentication Token
     * @param {string} clientId - Client ID
     * @param {string} clientSecret - Client secret
     * @returns {Promise<Object>} - Token response object
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/authentication/obtain-authentication-token
     */
    async generateToken(clientId, clientSecret) {
        if (!clientId || !clientSecret) {
            throw new Error('Client ID and Client Secret are required');
        }

        const tokenData = { clientId, clientSecret };
        const tokenResponse = await this.client.post(
            API_ENDPOINTS.AUTH_TOKEN,
            tokenData
        );

        return tokenResponse.data.result;
    }
}

module.exports = MaibMiaAuthRequest;
