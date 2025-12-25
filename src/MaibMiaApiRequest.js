/**
 * Node.js SDK for maib MIA API
 * API Request Handler
 */

const { API_ENDPOINTS, REQUIRED_PARAMS } = require('./constants');
const { MaibMiaValidationError } = require('./errors');

const MaibMiaSdk = require('./MaibMiaSdk');

class MaibMiaApiRequest {
    //#region Init
    /**
     * Create a new MaibMiaApiRequest instance
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
     * @returns {MaibMiaApiRequest}
     */
    static create(baseUrl = MaibMiaSdk.DEFAULT_BASE_URL, timeout = MaibMiaSdk.DEFAULT_TIMEOUT) {
        return new MaibMiaApiRequest(baseUrl, timeout);
    }
    //#endregion

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
        MaibMiaApiRequest._validateAccessToken(token);
        MaibMiaApiRequest._validateParams(data, requiredParams);

        return this.client._sendRequest(method, endpoint, data, params, token);
    }

    /**
     * Replace path parameters in URL
     * @param {string} path - URL path with parameters
     * @param {Object} params - Parameters to replace
     * @returns {string} - Path with replaced parameters
     */
    static _buildEndpoint(path, params) {
        let result = path;

        for (const [key, value] of Object.entries(params)) {
            MaibMiaApiRequest._validateIdParam(value);
            result = result.replace(`:${key}`, value);
        }

        return result;
    }

    /**
     * Validates Entity ID
     * @param {string} entityId - Entity ID
     * @throws {MaibMiaValidationError} - If Entity ID parameter is invalid
     */
    static _validateIdParam(entityId) {
        if (!entityId) {
            throw new MaibMiaValidationError('ID parameter is required');
        }
    }

    /**
     * Validates the access token
     * @param {string} token - Access token
     * @throws {MaibMiaValidationError} - If Access token parameter is invalid
     */
    static _validateAccessToken(token) {
        if (!token) {
            throw new MaibMiaValidationError('Access token is required');
        }
    }

    /**
     * Validate required parameters
     * @param {Object} data - Data object to validate
     * @param {string[]} requiredParams - Array of required parameter names
     * @throws {MaibMiaValidationError} - If any required parameter is missing
     */
    static _validateParams(data, requiredParams) {
        if (!data || !requiredParams)
            return;

        const missingParams = requiredParams.filter(field =>
            data[field] === undefined || data[field] === null
        );

        if (missingParams.length > 0) {
            throw new MaibMiaValidationError(`Missing required parameters: ${missingParams.join(', ')}`);
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
        return this._executeOperation(API_ENDPOINTS.MIA_QR, token, data, REQUIRED_PARAMS.QR_PARAMS);
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
        return this._executeOperation(API_ENDPOINTS.MIA_QR_HYBRID, token, data, REQUIRED_PARAMS.QR_HYBRID_PARAMS);
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_QR_EXTENSION, { qrId });
        return this._executeOperation(endpoint, token, data, REQUIRED_PARAMS.QR_EXTENSION_PARAMS);
    }

    /**
     * Retrieve QR Details by ID
     * @param {string} qrId - QR code ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR details
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-qr-details-by-id
     */
    async qrDetails(qrId, token) {
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_QR_ID, { qrId });
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_QR_CANCEL, { qrId });
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_QR_EXTENSION_CANCEL, { qrId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Retrieve List of QR Codes with Filtering Options
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Retrieval response
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
        return this._executeOperation(API_ENDPOINTS.MIA_TEST_PAY, token, data, REQUIRED_PARAMS.TEST_PAY_PARAMS);
    }

    /**
     * Retrieve Payment Details by ID
     * @param {string} payId - Payment ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Payment details response
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-payment-details-by-id
     */
    async paymentDetails(payId, token) {
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_PAYMENTS_ID, { payId });
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_PAYMENTS_REFUND, { payId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * Retrieve List of Payments with Filtering Options
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @link https://docs.maibmerchants.md/mia-qr-api/en/endpoints/information-retrieval-get/retrieve-list-of-payments-with-filtering-options
     * @returns {Promise<Object>} - Retrieval response
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
        return this._executeOperation(API_ENDPOINTS.MIA_RTP, token, data, REQUIRED_PARAMS.RTP_PARAMS);
    }

    /**
     * Retrieve the status of a payment request
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP status response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/retrieve-the-status-of-a-payment-request
     */
    async rtpStatus(rtpId, token) {
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_RTP_ID, { rtpId });
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_RTP_CANCEL, { rtpId });
        return this._executeOperation(endpoint, token, data);
    }

    /**
     * List all payment requests
     * @param {Object} params - Retrieval params
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Retrieval response
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_RTP_REFUND, { payId });
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
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_RTP_TEST_ACCEPT, { rtpId });
        return this._executeOperation(endpoint, token, data, REQUIRED_PARAMS.TEST_ACCEPT_PARAMS);
    }

    /**
     * Simulate rejection of a payment request
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Test reject response
     * @link https://docs.maibmerchants.md/request-to-pay/api-reference/sandbox-simulation-environment/simulate-rejection-of-a-payment-request
     */
    async rtpTestReject(rtpId, token) {
        const endpoint = MaibMiaApiRequest._buildEndpoint(API_ENDPOINTS.MIA_RTP_TEST_REJECT, { rtpId });
        return this._executeOperation(endpoint, token);
    }
    //#endregion
}

module.exports = MaibMiaApiRequest;
