require('dotenv').config();

const {
    MaibMiaSdk,
    MaibMiaAuthRequest,
    MaibMiaApiRequest
} = require('../src');

const CLIENT_ID = process.env.MAIB_MIA_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIB_MIA_CLIENT_SECRET;
const SIGNATURE_KEY = process.env.MAIB_MIA_SIGNATURE_KEY;

async function testPayment() {
    // Get Access Token with Client ID and Client Secret
    const maibMiaAuth = await MaibMiaAuthRequest
        .create(MaibMiaSdk.SANDBOX_BASE_URL)
        .generateToken(CLIENT_ID, CLIENT_SECRET);

    const maibMiaToken = maibMiaAuth.accessToken;
    const maibMiaApiRequest = MaibMiaApiRequest.create(MaibMiaSdk.SANDBOX_BASE_URL);

    // Create a dynamic order payment QR
    const maibMiaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const maibMiaQrData = {
        'type': 'Dynamic',
        'expiresAt': maibMiaExpiresAt,
        'amountType': 'Fixed',
        'amount': 50.00,
        'currency': 'MDL',
        'orderId': '123',
        'description': 'Order #123',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    }

    const maibMiaQrCreateResponse = await maibMiaApiRequest.qrCreate(maibMiaQrData, maibMiaToken);
    console.debug(maibMiaQrCreateResponse);

    // Create a hybrid QR
    const maibMiaQrHybridData = {
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
    }

    const maibMiaQrCreateHybridResponse = await maibMiaApiRequest.qrCreateHybrid(maibMiaQrHybridData, maibMiaToken);
    console.debug(maibMiaQrCreateHybridResponse);

    // Create QR Extension
    const maibMiaQrExtensionData = {
        'expiresAt': maibMiaExpiresAt,
        'amount': 100.00,
        'description': 'Updated Order #456 description',
        'orderId': '456',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    }

    const qrHybridId = maibMiaQrCreateHybridResponse['qrId'];
    // const maibMiaQrCreateExtensionResponse = await maibMiaApiRequest.qrCreateExtension(qrHybridId, maibMiaQrExtensionData, maibMiaToken);
    // console.debug(maibMiaQrCreateExtensionResponse);

    const maibMiaQrCancelData = {
        'reason': 'Test cancel reason'
    }

    // Cancel Active QR Extension (Hybrid)
    const maibMiaQrCancelExtensionResponse = await maibMiaApiRequest.qrCancelExtension(qrHybridId, maibMiaQrCancelData, maibMiaToken);
    console.debug(maibMiaQrCancelExtensionResponse);

    // Cancel Active QR (Static, Dynamic)
    const maibMiaQrCancelResponse = await maibMiaApiRequest.qrCancel(qrHybridId, maibMiaQrCancelData, maibMiaToken);
    console.debug(maibMiaQrCancelResponse);

    // Get QR details
    const qrId = maibMiaQrCreateResponse['qrId'];
    const maibMiaQrDetailsResponse = await maibMiaApiRequest.qrDetails(qrId, maibMiaToken);
    console.debug(maibMiaQrDetailsResponse);

    //Display List of QR Codes
    const maibMiaQrListParams = {
        'count': 10,
        'offset': 0,
        'amountFrom': 10.00,
        'amountTo': 100.00,
        'sortBy': 'createdAt',
        'order': 'desc'
    }

    const maibMiaQrListResponse = await maibMiaApiRequest.qrList(maibMiaQrListParams, maibMiaToken);
    console.debug(maibMiaQrListResponse);

    // Perform a test QR payment
    const maibTestPayData = {
        'qrId': qrId,
        'amount': maibMiaQrData['amount'],
        'iban': 'MD88AG000000011621810140',
        'currency': maibMiaQrData['currency'],
        'payerName': 'TEST QR PAYMENT'
    }

    const maibMiaTestPayResponse = await maibMiaApiRequest.testPay(maibTestPayData, maibMiaToken);
    console.debug(maibMiaTestPayResponse);

    // Get payment details
    const payId = maibMiaTestPayResponse['payId'];
    const maibMiaPaymentDetailsResponse = await maibMiaApiRequest.paymentDetails(payId, maibMiaToken);
    console.debug(maibMiaPaymentDetailsResponse);

    // Refund payment
    const maibMiaPaymentRefundData = {
        'reason': 'Test refund reason'
    }

    const maibMiaPaymentRefundResponse = await maibMiaApiRequest.paymentRefund(payId, maibMiaPaymentRefundData, maibMiaToken);
    console.debug(maibMiaPaymentRefundResponse);

    // Retrieve List of Payments
    const maibMiaPaymentListParams = {
        'count': 10,
        'offset': 0,
        'qrId': qrId,
        'sortBy': 'executedAt',
        'order': 'asc'
    }

    const maibMiaPaymentListResponse = await maibMiaApiRequest.paymentList(maibMiaPaymentListParams, maibMiaToken);
    console.debug(maibMiaPaymentListResponse);
}

function testValidateCallbackSignature() {
    const callbackData = {
        "result": {
            "qrId": "c3108b2f-6c2e-43a2-bdea-123456789012",
            "extensionId": "3fe7f013-23a6-4d09-a4a4-123456789012",
            "qrStatus": "Paid",
            "payId": "eb361f48-bb39-45e2-950b-123456789012",
            "referenceId": "MIA0001234567",
            "orderId": "123",
            "amount": 50.00,
            "commission": 0.1,
            "currency": "MDL",
            "payerName": "TEST QR PAYMENT",
            "payerIban": "MD88AG000000011621810140",
            "executedAt": "2025-04-18T14:04:11.81145+00:00",
            "terminalId": null
        },
        "signature": "fHM+l4L1ycFWZDRTh/Vr8oybq1Q1xySdjyvmFQCmZ4s="
    }

    const validateCallbackResult = MaibMiaSdk.validateCallbackSignature(callbackData, SIGNATURE_KEY);
    console.log('Validation Result:', validateCallbackResult);
}

testPayment();
testValidateCallbackSignature();
