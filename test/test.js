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

    expiresAt: null,

    // QR Flow Data
    dynamicQrId: null,
    hybridQrId: null,
    hybridQrExtensionId: null,
    qrPayId: null,
    qrData: null,

    // RTP Flow Data
    rtpId: null,
    rtpPayId: null,
    rtpData: null
};

function init() {
    console.log('Running: init');

    expect(MAIB_MIA_CLIENT_ID).toBeTruthy();
    expect(MAIB_MIA_CLIENT_SECRET).toBeTruthy();
    expect(MAIB_MIA_SIGNATURE_KEY).toBeTruthy();

    context.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function assertResultOk(response) {
    expect(response).toBeDefined();
}

//#region Authentication
async function testAuthenticate() {
    console.log('Running: authenticate');

    context.apiRequest = MaibMiaApiRequest.create(MaibMiaSdk.SANDBOX_BASE_URL);
    //context.apiRequest.client.setupLogging();

    const response = await context.apiRequest.generateToken(MAIB_MIA_CLIENT_ID, MAIB_MIA_CLIENT_SECRET);

    assertResultOk(response);
    expect(response).toHaveProperty('accessToken')
    expect(response.accessToken).toBeTruthy();

    context.accessToken = response.accessToken;
}
//#endregion

//#region QR
async function testQrCreateDynamic() {
    console.log('Running: testQrCreateDynamic');

    context.qrData = {
        'type': 'Dynamic',
        'expiresAt': context.expiresAt,
        'amountType': 'Fixed',
        'amount': 50.00,
        'currency': 'MDL',
        'orderId': '123',
        'description': 'Order #123',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.qrCreate(context.qrData, context.accessToken);
    console.debug('qrCreate', response);

    assertResultOk(response);
    expect(response).toHaveProperty('qrId');
    expect(response.qrId).toBeTruthy();

    context.dynamicQrId = response.qrId;
}

async function testQrCreateHybrid() {
    console.log('Running: testQrCreateHybrid');

    context.hybridData = {
        'amountType': 'Fixed',
        'currency': 'MDL',
        'terminalId': 'P011111',
        'extension': {
            'expiresAt': context.expiresAt,
            'amount': 50.00,
            'description': 'Order #123',
            'orderId': '123',
            'callbackUrl': 'https://example.com/callback',
            'redirectUrl': 'https://example.com/success'
        }
    };

    const response = await context.apiRequest.qrCreateHybrid(context.hybridData, context.accessToken);
    console.debug('qrCreateHybrid', response);

    assertResultOk(response);
    expect(response).toHaveProperty('qrId');
    expect(response.qrId).toBeTruthy();

    context.hybridQrId = response.qrId;
    context.hybridQrExtensionId = response.extensionId;
}

async function testQrCreateExtension() {
    console.log('Running: testQrCreateExtension');

    const extensionData = {
        'expiresAt': context.expiresAt,
        'amount': 100.00,
        'description': 'Updated Order #456 description',
        'orderId': '456',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.qrCreateExtension(context.hybridQrId, extensionData, context.accessToken);
    console.debug('qrCreateExtension', response);

    assertResultOk(response);
}

async function testQrCancel() {
    console.log('Running: testQrCancel');

    const cancelData = { 'reason': 'testQrCancel reason' };
    const response = await context.apiRequest.qrCancel(context.hybridQrId, cancelData, context.accessToken);
    console.debug('qrCancel', response);

    assertResultOk(response);
    expect(response.qrId).toEqual(context.hybridQrId);
    expect(response.status).toEqual('Cancelled');
}

async function testQrCancelExtension() {
    console.log('Running: testQrCancelExtension');

    const cancelData = { 'reason': 'testQrCancelExtension reason' };
    const response = await context.apiRequest.qrCancelExtension(context.hybridQrId, cancelData, context.accessToken);
    console.debug('qrCancelExtension', response);

    assertResultOk(response);
    expect(response.extensionId).toEqual(context.hybridQrExtensionId);
}

async function testQrDetails() {
    console.log('Running: testQrDetails');

    const response = await context.apiRequest.qrDetails(context.dynamicQrId, context.accessToken);
    console.debug('qrDetails', response);

    assertResultOk(response);
    expect(response.qrId).toEqual(context.dynamicQrId);
    expect(response.status).toEqual('Active');
    expect(response.amount).toEqual(context.qrData.amount);
    expect(response.currency).toEqual(context.qrData.currency);
}

async function testQrList() {
    console.log('Running: testQrList');

    const qrListParams = {
        'count': 10,
        'offset': 0,
        'amountFrom': 10.00,
        'amountTo': 100.00,
        'sortBy': 'createdAt',
        'order': 'desc'
    };

    const response = await context.apiRequest.qrList(qrListParams, context.accessToken);
    console.debug('qrList', response);

    assertResultOk(response);
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('totalCount');
    expect(response.items).toBeTruthy();
    expect(response.totalCount).toBeTruthy();
}

async function testPay() {
    console.log('Running: testPay');

    const testPayData = {
        'qrId': context.dynamicQrId,
        'amount': context.qrData.amount,
        'currency': context.qrData.currency,
        'iban': 'MD88AG000000011621810140',
        'payerName': 'TEST QR PAYMENT'
    };

    const response = await context.apiRequest.testPay(testPayData, context.accessToken);
    console.debug('testPay', response);

    assertResultOk(response);
    expect(response.qrId).toEqual(context.dynamicQrId);
    expect(response.qrStatus).toEqual('Paid');
    expect(response.amount).toEqual(context.qrData.amount);
    expect(response.currency).toEqual(context.qrData.currency);
    expect(response.payId).toBeTruthy();

    context.qrPayId = response.payId;
}
//#endregion

//#region Payment
async function testPaymentDetails() {
    console.log('Running: testPaymentDetails');

    const response = await context.apiRequest.paymentDetails(context.qrPayId, context.accessToken);
    console.debug('paymentDetails', response);

    assertResultOk(response);
    expect(response.payId).toEqual(context.qrPayId);
    expect(response.status).toEqual('Executed');
    expect(response.amount).toEqual(context.qrData.amount);
    expect(response.currency).toEqual(context.qrData.currency);
}

async function testPaymentRefundPartial() {
    console.log('Running: testPaymentRefundPartial');

    const refundData = {
        'amount': context.qrData.amount / 2,
        'reason': 'Test refund reason',
        'callbackUrl': 'https://example.com/refund'
    };

    const response = await context.apiRequest.paymentRefund(context.qrPayId, refundData, context.accessToken);
    console.debug('paymentRefund', response);

    assertResultOk(response);
    expect(response.refundId).toEqual('00000000-0000-0000-0000-000000000000');
    expect(response.status).toEqual('Created');
}

async function testPaymentRefundFull() {
    console.log('Running: testPaymentRefundFull');

    const refundData = {
        'reason': 'Test refund reason',
        'callbackUrl': 'https://example.com/refund'
    };

    const response = await context.apiRequest.paymentRefund(context.qrPayId, refundData, context.accessToken);
    console.debug('paymentRefund', response);

    assertResultOk(response);
    expect(response.refundId).toEqual('00000000-0000-0000-0000-000000000000');
    expect(response.status).toEqual('Created');
}

async function testPaymentList() {
    console.log('Running: testPaymentList');

    const params = {
        'count': 10,
        'offset': 0,
        'qrId': context.dynamicQrId,
        'sortBy': 'executedAt',
        'order': 'asc'
    };

    const response = await context.apiRequest.paymentList(params, context.accessToken);
    console.debug('paymentList', response);

    assertResultOk(response);
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('totalCount');
}
//#endregion

//#region RTP
async function testRtpCreate() {
    console.log('Running: testRtpCreate');

    context.rtpData = {
        'alias': '37369112221',
        'amount': 150.00,
        'expiresAt': context.expiresAt,
        'currency': 'MDL',
        'description': 'Invoice #123',
        'orderId': '123',
        'terminalId': 'P011111',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    };

    const response = await context.apiRequest.rtpCreate(context.rtpData, context.accessToken);
    console.debug('rtpCreate', response);

    assertResultOk(response);
    expect(response.rtpId).toBeTruthy();

    context.rtpId = response.rtpId;
}

async function testRtpStatus() {
    console.log('Running: testRtpStatus');

    const response = await context.apiRequest.rtpStatus(context.rtpId, context.accessToken);
    console.debug('rtpStatus', response);

    assertResultOk(response);
    expect(response.rtpId).toEqual(context.rtpId);
}

async function testRtpList() {
    console.log('Running: testRtpList');
    const params = {
        'count': 10,
        'offset': 0,
        'amount': 10.00,
        'sortBy': 'createdAt',
        'order': 'desc'
    };
    const response = await context.apiRequest.rtpList(params, context.accessToken);
    console.debug('rtpList', response);

    assertResultOk(response);
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('totalCount');
}

async function testRtpTestAccept() {
    console.log('Running: testRtpTestAccept');

    const acceptData = {
        'amount': context.rtpData.amount,
        'currency': context.rtpData.currency
    };

    const response = await context.apiRequest.rtpTestAccept(context.rtpId, acceptData, context.accessToken);
    console.debug('rtpTestAccept', response);

    assertResultOk(response);
    expect(response.payId).toBeTruthy();

    context.rtpPayId = response.payId;
}

async function testRtpRefund() {
    console.log('Running: testRtpRefund');

    const refundData = { 'reason': 'testRtpRefund reason' };
    const response = await context.apiRequest.rtpRefund(context.rtpPayId, refundData, context.accessToken);
    console.debug('rtpRefund', response);

    assertResultOk(response);
    expect(response.refundId).toEqual('00000000-0000-0000-0000-000000000000');
    expect(response.status).toEqual('Created');
}

async function testRtpCancel() {
    console.log('Running: testRtpCancel');

    const rtpToCancelResponse = await context.apiRequest.rtpCreate(context.rtpData, context.accessToken);
    console.debug('rtpCreate', rtpToCancelResponse);

    const rtpIdToCancel = rtpToCancelResponse.rtpId;
    const cancelData = { 'reason': 'testRtpCancel reason' };

    const response = await context.apiRequest.rtpCancel(rtpIdToCancel, cancelData, context.accessToken);
    console.debug('rtpCancel', response);

    assertResultOk(response);
    expect(response.rtpId).toEqual(rtpIdToCancel);
    expect(response.status).toEqual('Cancelled');
}
//#endregion

//#region Callback
async function testValidateCallbackSignature() {
    console.log('Running: testValidateCallbackSignature');

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

    expect(MaibMiaSdk.validateCallbackSignature(callbackData, MAIB_MIA_SIGNATURE_KEY)).toEqual(false);

    callbackData.signature = MaibMiaSdk.computeDataSignature(callbackData.result, MAIB_MIA_SIGNATURE_KEY);
    expect(MaibMiaSdk.validateCallbackSignature(callbackData, MAIB_MIA_SIGNATURE_KEY)).toEqual(true);
}
//#endregion

//#region Execution
jest.setTimeout(60000);

describe('MaibMiaSdk Integration Tests', () => {
    beforeAll(init);
    beforeAll(testAuthenticate);

    describe('QR Payment Flow', () => {
        test('testQrCreateDynamic', testQrCreateDynamic);
        test('testQrCreateHybrid', testQrCreateHybrid);
        test.skip('testQrCreateExtension', testQrCreateExtension);
        test('testQrCancelExtension', testQrCancelExtension);
        test('testQrCancel', testQrCancel);
        test('testQrDetails', testQrDetails);
        test('testQrList', testQrList);
        test('testPay', testPay);
        test('testPaymentDetails', testPaymentDetails);
        test('testPaymentRefundPartial', testPaymentRefundPartial);
        test('testPaymentRefundFull', testPaymentRefundFull);
        test('testPaymentList', testPaymentList);
    });

    describe('RTP Payment Flow', () => {
        test('testRtpCreate', testRtpCreate);
        test('testRtpStatus', testRtpStatus);
        test('testRtpList', testRtpList);
        test('testRtpTestAccept', testRtpTestAccept);
        test('testRtpRefund', testRtpRefund);
        test('testRtpCancel', testRtpCancel);
    });

    test('testValidateCallbackSignature', testValidateCallbackSignature);
});
//#endregion
