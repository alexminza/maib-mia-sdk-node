/**
 * Node.js SDK for maib MIA API
 * API Request Handler
 */

const axios = require('axios');
const { API_ENDPOINTS, DEFAULT_TIMEOUT, REQUIRED_QR_PARAMS, REQUIRED_QR_HYBRID_PARAMS, REQUIRED_RTP_PARAMS } = require('./constants');
const { createError, replacePath } = require('./utils');

class MaibMiaApiRequest {
    /**
     * Create a new MaibMiaApiRequest instance
     * @param {string} baseUrl - Base URL for the API
     * @param {number} timeout - Request timeout in milliseconds
     */
    constructor(baseUrl, timeout = DEFAULT_TIMEOUT) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: timeout,
        });
    }

    /**
     * Static factory method to create an instance
     * @param {string} baseUrl - Base URL for the API
     * @param {number} timeout - Request timeout in milliseconds
     * @returns {MaibMiaApiRequest}
     */
    static create(baseUrl, timeout = DEFAULT_TIMEOUT) {
        return new MaibMiaApiRequest(baseUrl, timeout);
    }

    //#region Operation
    /**
     * Perform API request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {string} token - Access token
     * @param {string[]} requiredParams - Array of required field names
     * @param {string} method - Request HTTP method
     * @param {Object} params - Request params
     */
    async _executeOperation(endpoint, token, data=null, requiredParams=null, method='POST', params=null) {
        this._validateParams(data, requiredParams);
        return this._sendRequest(method, endpoint, data, params, token);
    }

    /**
     * Perform API request
     * @param {string} method - Request HTTP method
     * @param {string} url - Request URL
     * @param {Object} data - Request data
     * @param {Object} params - Request params
     * @param {string} token - Access token
     * @param {string} entity_id - Entity ID
     * @returns {Promise<Object>} API request response
     */
    async _sendRequest(method, url, data=null, params=null, token=null, entity_id=null) {
        if (!entity_id)
            url = replacePath(url, { entity_id });

        const requestConfig = {
            url: url,
            method: method,
            data: data,
            headers: this._getAuthHeaders(token),
            params: params
        }

        const response = await this.client.request(requestConfig);
        return response.data.result || response.data;
    }

    /**
     * Set authorization header
     * @param {string} token - Access token
     * @returns {Object} - Headers object
     */
    _getAuthHeaders(token) {
        if (!token) {
            throw createError('Access token is required');
        }

        return {
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Validates Entity ID
     * @param {string} entityId - Entity ID
     */
    _validateIdParam(entityId) {
        if (!entityId) {
            throw new Error('Invalid ID parameter. Should be string of 36 characters.');
        }
    }

    /**
     * Validate required fields in an object
     * @param {Object} data - Data object to validate
     * @param {string[]} requiredParams - Array of required field names
     * @throws {Error} - If any required field is missing
     */
    _validateParams(data, requiredParams) {
        if (!data || !requiredParams)
            return;

        const missingParams = requiredParams.filter(field =>
            data[field] === undefined || data[field] === null
        );

        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }
    }
    //#endregion

    //#region QR
    /**
     * Create QR Code (Static, Dynamic)
     * @param {Object} data - QR code data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR creation response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/overview/mia-qr-types
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-qr-code-static-dynamic
     */
    async qrCreate(data, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_QR, token, data, REQUIRED_QR_PARAMS);
    }

    /**
     * Create Hybrid QR Code
     * @param {Object} data - QR code data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR creation response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/overview/mia-qr-types
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-hybrid-qr-code
     */
    async qrCreateHybrid(data, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_QR_HYBRID, token, data, REQUIRED_QR_HYBRID_PARAMS);
    }

    /**
     * Create Extension for QR Code by ID
     * @param {string} qrId - QR code ID
     * @param {Object} data - QR code extension data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR creation response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-hybrid-qr-code/create-extension-for-qr-code-by-id
     */
    async qrCreateExtension(qrId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_QR_EXTENSION, { qrId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Retrieve QR Details by ID
     * @param {string} qrId - QR code ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR details
     * @lik https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-qr-details-by-id
     */
    async qrDetails(qrId, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_QR_ID, { qrId });
        return this._executeOperation(endpoint, token, null, null, 'GET');
    }

    /**
     * Cancel Active QR (Static, Dynamic)
     * @param {string} qrId - QR code ID
     * @param {Object} data - QR code cancellation data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Cancellation response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-cancellation/cancel-active-qr-static-dynamic
     */
    async qrCancel(qrId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_QR_CANCEL, { qrId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Cancel Active QR Extension (Hybrid)
     * @param {string} qrId - QR code ID
     * @param {Object} data - QR code extension cancellation data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Cancellation response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-cancellation/cancel-active-qr-extension-hybrid
     */
    async qrCancelExtension(qrId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_QR_EXTENSION_CANCEL, { qrId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Retrieve List of QR Codes with Filtering Options
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @returns - Retrieval response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/display-list-of-qr-codes-with-filtering-options
     */
    async qrList(params, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_QR, token, null, null, 'GET', params);
    }
    //#endregion

    //#region  Payment
    /**
     * Payment Simulation (Sandbox)
     * @param {Object} data - Test payment data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Test payment response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/payment-simulation-sandbox
     */
    async testPay(data, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_TEST_PAY, token, data);
    }

    /**
     * Retrieve Payment Details by ID
     * @param {string} payId - Payment ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Payment details response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-payment-details-by-id
     */
    async paymentDetails(payId, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_PAYMENTS_ID, { payId });
        return this._executeOperation(endpoint, token, null, null, 'GET');
    }

    /**
     * Refund Completed Payment
     * @param {string} payId - Payment ID
     * @param {Object} data - Refund data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Refund response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-refund/refund-completed-payment
     */
    async paymentRefund(payId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_PAYMENTS_REFUND, { payId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Retrieve List of Payments with Filtering Options
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-list-of-payments-with-filtering-options
     */
    async paymentList(params, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_PAYMENTS, token, null, null, 'GET', params);
    }
    //#endregion

    //#region RTP
    /**
     * Create a new payment request (RTP)
     * @param {Object} data - RTP data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP creation response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/create-a-new-payment-request-rtp
     */
    async rtpCreate(data, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_RTP, token, data, REQUIRED_RTP_PARAMS);
    }

    /**
     * Retrieve the status of a payment request
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP status response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/retrieve-the-status-of-a-payment-request
     */
    async rtpStatus(rtpId, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_RTP_ID, { rtpId });
        return this._executeOperation(endpoint, token, null, null, 'GET');
    }

    /**
     * Cancel a pending payment request
     * @param {string} rtpId - RTP ID
     * @param {Object} data - RTP cancellation data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP cancellation response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/cancel-a-pending-payment-request
     */
    async rtpCancel(rtpId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_RTP_CANCEL, { rtpId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * List all payment requests
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @returns - Retrieval response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/list-all-payment-requests
     */
    async rtpList(params, token) {
        return this._executeOperation(API_ENDPOINTS.MIA_RTP, token, null, null, 'GET', params);
    }

    /**
     * Initiate a refund for a completed payment
     * @param {string} payId - Payment ID
     * @param {Object} data - Refund data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Refund response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/initiate-a-refund-for-a-completed-payment
     */
    async rtpRefund(payId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_RTP_REFUND, { payId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Simulate acceptance of a payment request
     * @param {string} rtpId - RTP ID
     * @param {Object} data - Test payment data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Test accept response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/sandbox-simulation-environment/simulate-acceptance-of-a-payment-request
     */
    async rtpTestAccept(rtpId, data, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_RTP_TEST_ACCEPT, { rtpId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Simulate rejection of a payment request
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Test accept response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/sandbox-simulation-environment/simulate-rejection-of-a-payment-request
     */
    async rtpTestReject(rtpId, token) {
        const endpoint = replacePath(API_ENDPOINTS.MIA_RTP_TEST_REJECT, { rtpId });
        return this._executeOperation(endpoint, token);
    }
    //#endregion

    /**
     * Handle API errors
     * @param {string} message - Error message
     * @param {Error} error - Original error
     * @returns {Error} - Formatted error
     */
    _handleError(message, error) {
        if (error.response) {
            return createError(
                `${message}: ${error.response.data?.message || error.message}`,
                {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                }
            );
        }

        return createError(`${message}: ${error.message}`, {
            originalError: error
        });
    }
}

module.exports = MaibMiaApiRequest;
