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

    // Create a dynamic order payment QR
    const maibMiaQrData = {
        'type': 'Dynamic',
        'expiresAt': new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        'amountType': 'Fixed',
        'amount': 50.00,
        'currency': 'MDL',
        'orderId': '123',
        'description': 'Order #123',
        'callbackUrl': 'https://example.com/callback',
        'redirectUrl': 'https://example.com/success'
    }

    const maibMiaApiRequest = MaibMiaApiRequest.create(MaibMiaSdk.SANDBOX_BASE_URL);
    const maibMiaCreateQrResponse = await maibMiaApiRequest.qrCreate(maibMiaQrData, maibMiaToken);

    // Get QR details
    const qrId = maibMiaCreateQrResponse['qrId'];
    const qrDetails = await maibMiaApiRequest.qrDetails(qrId, maibMiaToken);
    console.debug(qrDetails);

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
