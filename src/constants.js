/**
 * Node.js SDK for maib MIA API
 * Constants
 */

// maib MIA QR API base urls
// https://docs.maibmerchants.md/mia-qr-api/en/overview/general-technical-specifications#available-base-urls
// https://docs.maibmerchants.md/request-to-pay/getting-started/api-fundamentals#available-environments
const DEFAULT_BASE_URL = 'https://api.maibmerchants.md/v2/';
const SANDBOX_BASE_URL = 'https://sandbox.maibmerchants.md/v2/';

const DEFAULT_TIMEOUT = 30000; // milliseconds

const API_ENDPOINTS = {
    AUTH_TOKEN: 'auth/token',

    // maib MIA QR API endpoints
    // https://docs.maibmerchants.md/mia-qr-api/en/endpoints
    MIA_QR: 'mia/qr',
    MIA_QR_HYBRID: 'mia/qr/hybrid',
    MIA_QR_ID: 'mia/qr/:qrId',
    MIA_QR_EXTENSION: 'mia/qr/:qrId/extension',
    MIA_QR_CANCEL: 'mia/qr/:qrId/cancel',
    MIA_QR_EXTENSION_CANCEL: 'mia/qr/:qrId/extension/cancel',
    MIA_PAYMENTS: 'mia/payments',
    MIA_PAYMENTS_ID: 'mia/payments/:payId',
    MIA_PAYMENTS_REFUND: 'mia/payments/:payId/refund',
    MIA_TEST_PAY: 'mia/test-pay',

    // maib RTP API endpoints
    // https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints
    MIA_RTP: 'rtp',
    MIA_RTP_ID: 'rtp/:rtpId',
    MIA_RTP_CANCEL: 'rtp/:rtpId/cancel',
    MIA_RTP_REFUND: 'rtp/:payId/refund',
    MIA_RTP_TEST_ACCEPT: 'rtp/:rtpId/test-accept',
    MIA_RTP_TEST_REJECT: 'rtp/:rtpId/test-reject'
};

const REQUIRED_PARAMS = {
    // https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-qr-code-static-dynamic#request-parameters-body
    QR_PARAMS: ['type', 'amountType', 'currency', 'description'],
    // https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-hybrid-qr-code#request-body-parameters
    QR_HYBRID_PARAMS: ['amountType', 'currency'],
    // https://docs.maibmerchants.md/mia-qr-api/en/endpoints/payment-initiation/create-hybrid-qr-code/create-extension-for-qr-code-by-id#request-parameters-body
    QR_EXTENSION_PARAMS: ['expiresAt', 'description'],
    // https://docs.maibmerchants.md/mia-qr-api/en/payment-simulation-sandbox#request-parameters-body-json
    TEST_PAY_PARAMS: ['qrId', 'amount', 'iban', 'currency', 'payerName'],
    // https://docs.maibmerchants.md/request-to-pay/api-reference/endpoints/create-a-new-payment-request-rtp#request-body-parameters
    RTP_PARAMS: ['alias', 'amount', 'currency', 'expiresAt', 'description'],
    // https://docs.maibmerchants.md/request-to-pay/api-reference/sandbox-simulation-environment/simulate-acceptance-of-a-payment-request#request-body-parameters
    TEST_ACCEPT_PARAMS: ['amount', 'currency']
}

module.exports = {
    DEFAULT_BASE_URL,
    SANDBOX_BASE_URL,
    DEFAULT_TIMEOUT,
    API_ENDPOINTS,
    REQUIRED_PARAMS
};
