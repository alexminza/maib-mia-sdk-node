/**
 * Node.js SDK for maib MIA API
 * Authentication Request Handler
 */

const { API_ENDPOINTS } = require('./constants');

const MaibMiaSdk = require('./MaibMiaSdk');

class MaibMiaAuthRequest {
    /**
     * Create a new MaibMiaAuthRequest instance
     * @param {string} baseUrl - maib MIA API base url
     * @param {number} timeout - API request timeout in milliseconds
     */
    constructor(baseUrl = MaibMiaSdk.DEFAULT_BASE_URL, timeout = MaibMiaSdk.DEFAULT_TIMEOUT) {
        this.client = new MaibMiaSdk(baseUrl, timeout);
    }

    /**
     * Static factory method to create an instance
     * @param {string} baseUrl - maib MIA API base url
     * @param {number} timeout - API request timeout in milliseconds
     * @returns {MaibMiaAuthRequest}
     */
    static create(baseUrl = MaibMiaSdk.DEFAULT_BASE_URL, timeout = MaibMiaSdk.DEFAULT_TIMEOUT) {
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
        return this.client._sendRequest('POST', API_ENDPOINTS.AUTH_TOKEN, tokenData);
    }
}

module.exports = MaibMiaAuthRequest;
