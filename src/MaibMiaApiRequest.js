/**
 * Node.js SDK for maib MIA API
 * API Request Handler
 */

const axios = require('axios');
const { API_ENDPOINTS, DEFAULT_TIMEOUT } = require('./constants');
const { createError, replacePath, validateRequiredFields } = require('./utils');

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
     * Create a dynamic QR code for payment
     * @param {Object} data - QR code data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR creation response
     */
    async createQr(data, token) {
        const requiredFields = ['type', 'expiresAt', 'amountType', 'amount', 'currency'];
        validateRequiredFields(data, requiredFields);

        try {
            const response = await this.client.post(
                API_ENDPOINTS.MIA_QR,
                data,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('QR creation failed', error);
        }
    }

    /**
     * Get QR code details
     * @param {string} qrId - QR code ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - QR details
     */
    async getQrDetails(qrId, token) {
        if (!qrId) {
            throw createError('QR ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.MIA_QR_ID, { qrId });
            const response = await this.client.get(
                url,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Failed to get QR details', error);
        }
    }

    /**
     * Delete a QR code
     * @param {string} qrId - QR code ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Deletion response
     */
    async deleteQr(qrId, token) {
        if (!qrId) {
            throw createError('QR ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.QR_DELETE, { qrId });
            const response = await this.client.delete(
                url,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Failed to delete QR', error);
        }
    }

    /**
     * Create a Request to Pay (RTP)
     * @param {Object} data - RTP data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP creation response
     */
    async createRtp(data, token) {
        const requiredFields = ['alias', 'amount', 'currency', 'expiresAt'];
        validateRequiredFields(data, requiredFields);

        try {
            const response = await this.client.post(
                API_ENDPOINTS.RTP_CREATE,
                data,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('RTP creation failed', error);
        }
    }

    /**
     * Get RTP details
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - RTP details
     */
    async getRtpDetails(rtpId, token) {
        if (!rtpId) {
            throw createError('RTP ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.RTP_DETAILS, { rtpId });
            const response = await this.client.get(
                url,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Failed to get RTP details', error);
        }
    }

    /**
     * Delete an RTP
     * @param {string} rtpId - RTP ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Deletion response
     */
    async deleteRtp(rtpId, token) {
        if (!rtpId) {
            throw createError('RTP ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.RTP_DELETE, { rtpId });
            const response = await this.client.delete(
                url,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Failed to delete RTP', error);
        }
    }

    /**
     * Get payment details
     * @param {string} payId - Payment ID
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Payment details
     */
    async getPaymentDetails(payId, token) {
        if (!payId) {
            throw createError('Payment ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.MIA_PAYMENTS_ID, { payId });
            const response = await this.client.get(
                url,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Failed to get payment details', error);
        }
    }

    /**
     * Refund a payment
     * @param {string} payId - Payment ID
     * @param {Object} data - Refund data (reason)
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Refund response
     */
    async refundPayment(payId, data, token) {
        if (!payId) {
            throw createError('Payment ID is required');
        }

        try {
            const url = replacePath(API_ENDPOINTS.MIA_PAYMENTS_REFUND, { payId });
            const response = await this.client.post(
                url,
                data,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Payment refund failed', error);
        }
    }

    /**
     * Execute a test payment (sandbox only)
     * @param {Object} data - Test payment data
     * @param {string} token - Access token
     * @returns {Promise<Object>} - Test payment response
     */
    async testPay(data, token) {
        const requiredFields = ['qrId', 'amount', 'iban', 'currency', 'payerName'];
        validateRequiredFields(data, requiredFields);

        try {
            const response = await this.client.post(
                API_ENDPOINTS.MIA_TEST_PAY,
                data,
                { headers: this._getAuthHeaders(token) }
            );

            return response.data.result || response.data;
        } catch (error) {
            throw this._handleError('Test payment failed', error);
        }
    }

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
