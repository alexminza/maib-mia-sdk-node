/**
 * Node.js SDK for maib MIA API
 * Main Class
 */

const { name: packageName, version: packageVersion } = require('../package.json');

const crypto = require('crypto');
const axios = require('axios');

const { SANDBOX_BASE_URL, DEFAULT_BASE_URL, DEFAULT_TIMEOUT } = require('./constants');
const { MaibMiaApiError, MaibMiaValidationError } = require('./errors');

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
            timeout: timeout,
            headers: {
                'User-Agent': `${packageName}-node/${packageVersion}`
            }
        });
    }

    setupLogging(logger = console) {
        this.client.interceptors.request.use(
            (config) => {
                const logData = MaibMiaSdk._getLogData(config, config);
                logger.debug(`${packageName} Request: ${logData.method} ${logData.url}`, logData);
                return config;
            },
            (error) => {
                logger.error(`${packageName} Request: ${error.message}`, error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                const logData = MaibMiaSdk._getLogData(response, response?.config);
                logger.debug(`${packageName} Response: ${logData.status} ${logData.method} ${logData.url}`, logData);
                return response;
            },
            (error) => {
                const config = error.response?.config || error.config;
                const logData = MaibMiaSdk._getLogData(error.response, config);
                logger.error(`${packageName} Error: ${logData.status ?? ''} ${logData.data ?? ''}`, logData, error);
                return Promise.reject(error);
            }
        );
    }

    static _getLogData(object, config) {
        const logData = {
            'method': config?.method?.toUpperCase(),
            'url': config ? axios.getUri(config) : undefined,
            'data': object?.data,
            'params': config?.params,
            // 'headers': object?.headers?.toJSON?.() || config?.headers?.toJSON?.(),
            'status': object?.status
        }

        return logData;
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
    async _sendRequest(method, url, data = null, params = null, token = null) {
        const requestConfig = {
            url: url,
            method: method,
            data: data,
            headers: {
                ...this.client.defaults.headers.common,
                ...MaibMiaSdk._getAuthHeaders(token)
            },
            params: params,
            // https://github.com/axios/axios/issues/41
            validateStatus: () => true
        }

        const response = await this.client.request(requestConfig);
        return MaibMiaSdk._handleResponse(response, url);
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
     * @throws {MaibMiaApiError} - When received a server error from the API
     */
    static _handleResponse(response, endpoint) {
        if (!response.data)
            throw new MaibMiaApiError(`Invalid response received from server for endpoint ${endpoint}`, response);

        if (response.data.ok) {
            if (response.data.result)
                return response.data.result;

            throw new MaibMiaApiError(`Invalid response received from server for endpoint ${endpoint}: missing 'result' field`, response);
        }

        if (response.data.errors && response.data.errors.length > 0) {
            const errorMessages = response.data.errors.map(error => `${error.errorMessage} (${error.errorCode})`).join('; ');
            throw new MaibMiaApiError(`Error sending request to endpoint ${endpoint}: ${errorMessages}`, response);
        }

        throw new MaibMiaApiError(`Invalid response received from server for endpoint ${endpoint}: missing 'ok' and 'errors' fields`, response);
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
     * @throws {MaibMiaValidationError} - If Callback data or Signature Key are invalid
     */
    static validateCallbackSignature(callbackData, signatureKey) {
        if (!signatureKey) {
            throw new MaibMiaValidationError('Invalid signature key');
        }

        if (!callbackData?.signature || !callbackData?.result) {
            throw new MaibMiaValidationError('Missing result or signature in callback data');
        }

        const computedResultSignature = MaibMiaSdk.computeDataSignature(callbackData.result, signatureKey);
        return crypto.timingSafeEqual(Buffer.from(computedResultSignature), Buffer.from(callbackData.signature));
    }

    static computeDataSignature(resultData, signatureKey) {
        const keys = {};

        // Collect and format values
        for (const [key, value] of Object.entries(resultData)) {
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
        return crypto.createHash('sha256').update(hashInput, 'utf8').digest('base64');
    }
}

module.exports = MaibMiaSdk;
