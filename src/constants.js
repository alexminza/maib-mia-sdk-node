/**
 * Node.js SDK for maib MIA API
 * Constants
 */

const SANDBOX_BASE_URL = 'https://tstapi.maibmerchants.md';
const PRODUCTION_BASE_URL = 'https://api.maibmerchants.md';

const API_ENDPOINTS = {
    AUTH_TOKEN: '/v1/oauth2/token',
    QR_CREATE: '/v1/qr',
    QR_DETAILS: '/v1/qr/:qrId',
    QR_DELETE: '/v1/qr/:qrId',
    RTP_CREATE: '/v1/rtp',
    RTP_DETAILS: '/v1/rtp/:rtpId',
    RTP_DELETE: '/v1/rtp/:rtpId',
    PAYMENT_DETAILS: '/v1/payment/:payId',
    PAYMENT_REFUND: '/v1/payment/:payId/refund',
    TEST_PAY: '/v1/qr/pay'
};

const QR_TYPES = {
    DYNAMIC: 'Dynamic',
    STATIC: 'Static'
};

const AMOUNT_TYPES = {
    FIXED: 'Fixed',
    FLEXIBLE: 'Flexible'
};

const CURRENCIES = {
    MDL: 'MDL',
    EUR: 'EUR',
    USD: 'USD'
};

const QR_STATUS = {
    PENDING: 'Pending',
    PAID: 'Paid',
    EXPIRED: 'Expired',
    DELETED: 'Deleted'
};

const DEFAULT_TIMEOUT = 15000; // 15 seconds

module.exports = {
    SANDBOX_BASE_URL,
    PRODUCTION_BASE_URL,
    API_ENDPOINTS,
    QR_TYPES,
    AMOUNT_TYPES,
    CURRENCIES,
    QR_STATUS,
    DEFAULT_TIMEOUT
};
