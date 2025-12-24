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
            timeout: timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
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
     * Generate access token using client credentials
     * @param {string} clientId - Client ID
     * @param {string} clientSecret - Client secret
     * @returns {Promise<Object>} - Token response object
     */
    async generateToken(clientId, clientSecret) {
        if (!clientId || !clientSecret) {
            throw createError('Client ID and Client Secret are required');
        }

        try {
            const requestBody = {
                client_id: clientId,
                client_secret: clientSecret
            };

            const response = await this.client.post(
                API_ENDPOINTS.AUTH_TOKEN,
                requestBody
            );

            if (response.data && response.data.result) {
                return response.data.result;
            }

            if (response.data && response.data.accessToken) {
                return response.data;
            }

            throw createError('Invalid token response format', {
                response: response.data
            });

        } catch (error) {
            if (error.response) {
                throw createError(
                    `Authentication failed: ${error.response.data?.message || error.message}`,
                    {
                        status: error.response.status,
                        data: error.response.data
                    }
                );
            }

            throw createError(`Authentication request failed: ${error.message}`, {
                originalError: error
            });
        }
    }
}

module.exports = MaibMiaAuthRequest;
