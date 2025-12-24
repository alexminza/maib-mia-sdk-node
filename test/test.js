require('dotenv').config();

const {
    MaibMiaSdk,
    MaibMiaAuthRequest,
    MaibMiaApiRequest
} = require('../src');

const CLIENT_ID = process.env.MAIB_MIA_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIB_MIA_CLIENT_SECRET;
const SIGNATURE_KEY = process.env.MAIB_MIA_SIGNATURE_KEY;

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