require('dotenv').config();

const {
    MaibMiaSdk,
    MaibMiaApiRequest
} = require('../src');

const MAIB_MIA_CLIENT_ID = process.env.MAIB_MIA_CLIENT_ID;
const MAIB_MIA_CLIENT_SECRET = process.env.MAIB_MIA_CLIENT_SECRET;
const MAIB_MIA_SIGNATURE_KEY = process.env.MAIB_MIA_SIGNATURE_KEY;

// Shared Context
const context = {
    accessToken: null,
    apiRequest: null,

    // QR Flow Data
    dynamicQrId: null,
    hybridQrId: null,
    qrPayId: null,
    qrData: null,

    // RTP Flow Data
    rtpId: null,
    rtpPayId: null,
    rtpIdToCancel: null,
    rtpData: null
};

//#region Authentication
function checkInit() {
    console.log('Running: Check Init');
    expect(MAIB_MIA_CLIENT_ID).toBeTruthy();
    expect(MAIB_MIA_CLIENT_SECRET).toBeTruthy();
    expect(MAIB_MIA_SIGNATURE_KEY).toBeTruthy();
}

async function authenticate() {
    console.log('Running: Authenticate');
    context.apiRequest = MaibMiaApiRequest.create(MaibMiaSdk.SANDBOX_BASE_URL);

    const response = await context.apiRequest.generateToken(MAIB_MIA_CLIENT_ID, MAIB_MIA_CLIENT_SECRET);
    expect(response).toHaveProperty('accessToken')
    context.accessToken = response.accessToken;
    expect(context.accessToken).toBeTruthy();
}
//#endregion

//#region QR
async function createDynamicQr() {
    console.log('Running: Create Dynamic QR');
    const maibMiaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    context.qrData = {
        'type': 'Dynamic',
        'expiresAt': maibMiaExpiresAt,
        'amountType': 'Fixed',
        'amount': 50.00,
        'currency': 'MDL',
        'orderId': '123',
        'description': 'Order #123',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.qrCreate(context.qrData, context.accessToken);
    console.debug('qrCreateResponse', response);
    expect(response).toHaveProperty('qrId');
    context.dynamicQrId = response.qrId;
}

async function createHybridQr() {
    console.log('Running: Create Hybrid QR');
    const maibMiaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const hybridData = {
        'amountType': 'Fixed',
        'currency': 'MDL',
        'terminalId': 'P011111',
        'extension': {
            'expiresAt': maibMiaExpiresAt,
            'amount': 50.00,
            'description': 'Order #123',
            'orderId': '123',
            'callbackUrl': 'https://example.com/callback',
            'redirectUrl': 'https://example.com/success'
        }
    };

    const response = await context.apiRequest.qrCreateHybrid(hybridData, context.accessToken);
    console.debug('qrCreateHybridResponse', response);
    expect(response).toHaveProperty('qrId');
    context.hybridQrId = response.qrId;
}

async function createQrExtension() {
    console.log('Running: Create QR Extension');
    const maibMiaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const extensionData = {
        'expiresAt': maibMiaExpiresAt,
        'amount': 100.00,
        'description': 'Updated Order #456 description',
        'orderId': '456',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.qrCreateExtension(context.hybridQrId, extensionData, context.accessToken);
    console.debug('qrCreateExtensionResponse', response);
    expect(response).toBeDefined();
}

async function cancelQrExtension() {
    console.log('Running: Cancel QR Extension');
    const cancelData = { 'reason': 'Test cancel reason' };
    const response = await context.apiRequest.qrCancelExtension(context.hybridQrId, cancelData, context.accessToken);
    console.debug('qrCancelExtensionResponse', response);
    expect(response).toBeDefined();
}

async function cancelQr() {
    console.log('Running: Cancel QR');
    const cancelData = { 'reason': 'Test cancel reason' };
    const response = await context.apiRequest.qrCancel(context.hybridQrId, cancelData, context.accessToken);
    console.debug('qrCancelResponse', response);
    expect(response).toBeDefined();
}

async function getQrDetails() {
    console.log('Running: Get QR Details');
    const response = await context.apiRequest.qrDetails(context.dynamicQrId, context.accessToken);
    console.debug('qrDetailsResponse', response);
    expect(response).toBeDefined();
}

async function listQrCodes() {
    console.log('Running: List QR Codes');
    const params = {
        'count': 10,
        'offset': 0,
        'amountFrom': 10.00,
        'amountTo': 100.00,
        'sortBy': 'createdAt',
        'order': 'desc'
    };

    const response = await context.apiRequest.qrList(params, context.accessToken);
    console.debug('qrListResponse', response);
    expect(response).toBeDefined();
}

async function performTestQrPayment() {
    console.log('Running: Perform Test QR Payment');
    const testPayData = {
        'qrId': context.dynamicQrId,
        'amount': context.qrData.amount,
        'currency': context.qrData.currency,
        'iban': 'MD88AG000000011621810140',
        'payerName': 'TEST QR PAYMENT'
    };

    const response = await context.apiRequest.testPay(testPayData, context.accessToken);
    console.debug('testPayResponse', response);
    expect(response).toHaveProperty('payId');
    context.qrPayId = response.payId;
}
//#endregion

//#region Payment
async function getPaymentDetails() {
    console.log('Running: Get Payment Details');
    const response = await context.apiRequest.paymentDetails(context.qrPayId, context.accessToken);
    console.debug('paymentDetailsResponse', response);
    expect(response).toBeDefined();
}

async function refundPayment() {
    console.log('Running: Refund Payment');
    const refundData = { 'reason': 'Test refund reason' };
    const response = await context.apiRequest.paymentRefund(context.qrPayId, refundData, context.accessToken);
    console.debug('paymentRefundResponse', response);
    expect(response).toBeDefined();
}

async function listPayments() {
    console.log('Running: List Payments');
    const params = {
        'count': 10,
        'offset': 0,
        'qrId': context.dynamicQrId,
        'sortBy': 'executedAt',
        'order': 'asc'
    };

    const response = await context.apiRequest.paymentList(params, context.accessToken);
    console.debug('paymentListResponse', response);
    expect(response).toBeDefined();
}
//#endregion

//#region RTP
async function createRtpRequest() {
    console.log('Running: Create RTP Request');
    const maibMiaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    context.rtpData = {
        'alias': '37369112221',
        'amount': 150.00,
        'expiresAt': maibMiaExpiresAt,
        'currency': 'MDL',
        'description': 'Invoice #123',
        'orderId': '123',
        'terminalId': 'P011111',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.rtpCreate(context.rtpData, context.accessToken);
    console.debug('rtpCreateResponse', response);
    expect(response).toHaveProperty('rtpId');
    context.rtpId = response.rtpId;
}

async function getRtpStatus() {
    console.log('Running: Get RTP Status');
    const response = await context.apiRequest.rtpStatus(context.rtpId, context.accessToken);
    console.debug('rtpStatusResponse', response);
    expect(response).toBeDefined();
}

async function listRtpRequests() {
    console.log('Running: List RTP Requests');
    const params = {
        'count': 10,
        'offset': 0,
        'amount': 10.00,
        'sortBy': 'createdAt',
        'order': 'desc'
    };
    const response = await context.apiRequest.rtpList(params, context.accessToken);
    console.debug('rtpListResponse', response);
    expect(response).toBeDefined();
}

async function acceptRtpRequest() {
    console.log('Running: Accept RTP Request');
    const acceptData = { 'amount': 150.00, 'currency': 'MDL' };
    const response = await context.apiRequest.rtpTestAccept(context.rtpId, acceptData, context.accessToken);
    console.debug('rtpTestAcceptResponse', response);
    expect(response).toHaveProperty('payId');
    context.rtpPayId = response.payId;
}

async function refundRtpPayment() {
    console.log('Running: Refund RTP Payment');
    const refundData = { 'reason': 'Test refund reason' };
    const response = await context.apiRequest.rtpRefund(context.rtpPayId, refundData, context.accessToken);
    console.debug('rtpRefundResponse', response);
    expect(response).toBeDefined();
}

async function createRtpForCancel() {
    console.log('Running: Create RTP Request for Cancellation');
    const response = await context.apiRequest.rtpCreate(context.rtpData, context.accessToken);
    console.debug('rtpCreate2Response', response);
    expect(response).toHaveProperty('rtpId');
    context.rtpIdToCancel = response.rtpId;
}

async function cancelRtpRequest() {
    console.log('Running: Cancel RTP Request');
    const cancelData = { 'reason': 'Test cancel reason' };
    const response = await context.apiRequest.rtpCancel(context.rtpIdToCancel, cancelData, context.accessToken);
    console.debug('rtpCancel2Response', response);
    expect(response).toBeDefined();
}
//#endregion

//#region Callback
async function validateCallbackSignature() {
    console.log('Running: Validate Callback Signature');
    const callbackData = {
        'result': {
            'qrId': 'c3108b2f-6c2e-43a2-bdea-123456789012',
            'extensionId': '3fe7f013-23a6-4d09-a4a4-123456789012',
            'qrStatus': 'Paid',
            'payId': 'eb361f48-bb39-45e2-950b-123456789012',
            'referenceId': 'MIA0001234567',
            'orderId': '123',
            'amount': 50.00,
            'commission': 0.1,
            'currency': 'MDL',
            'payerName': 'TEST QR PAYMENT',
            'payerIban': 'MD88AG000000011621810140',
            'executedAt': '2025-04-18T14:04:11.81145+00:00',
            'terminalId': null
        },
        'signature': 'fHM+l4L1ycFWZDRTh/Vr8oybq1Q1xySdjyvmFQCmZ4s='
    };

    callbackData.signature = MaibMiaSdk.computeDataSignature(callbackData.result, MAIB_MIA_SIGNATURE_KEY);
    const validateCallbackResult = MaibMiaSdk.validateCallbackSignature(callbackData, MAIB_MIA_SIGNATURE_KEY);
    console.log('Validation Result:', validateCallbackResult);
    expect(validateCallbackResult).toBe(true);
}
//#endregion

//#region Execution
jest.setTimeout(60000);

describe('MaibMiaSdk Integration Tests', () => {
    beforeAll(checkInit);
    beforeAll(authenticate);

    describe('QR Payment Flow', () => {
        test('Create Dynamic QR', createDynamicQr);
        test('Create Hybrid QR', createHybridQr);
        test.skip('Create QR Extension', createQrExtension);
        test('Cancel QR Extension', cancelQrExtension);
        test('Cancel QR', cancelQr);
        test('Get QR Details', getQrDetails);
        test('List QR Codes', listQrCodes);
        test('Perform Test QR Payment', performTestQrPayment);
        test('Get Payment Details', getPaymentDetails);
        test('Refund Payment', refundPayment);
        test('List Payments', listPayments);
    });

    describe('RTP Payment Flow', () => {
        test('Create RTP Request', createRtpRequest);
        test('Get RTP Status', getRtpStatus);
        test('List RTP Requests', listRtpRequests);
        test('Accept RTP Request', acceptRtpRequest);
        test('Refund RTP Payment', refundRtpPayment);
        test('Create RTP for Cancellation', createRtpForCancel);
        test('Cancel RTP Request', cancelRtpRequest);
    });

    test('Validate Callback Signature', validateCallbackSignature);
});
//#endregion
