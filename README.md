# Node.js SDK for maib MIA API

![maib MIA](https://repository-images.githubusercontent.com/1122147023/29a661ec-62fc-4944-8518-569566fd0ef1)

* maib MIA QR API docs: https://docs.maibmerchants.md/mia-qr-api
* maib Request to Pay (RTP) docs: https://docs.maibmerchants.md/request-to-pay
* GitHub project https://github.com/alexminza/maib-mia-sdk-node
* NPM package https://www.npmjs.com/package/maib-mia-sdk

## Installation
To easily install or upgrade to the latest release, use `npm`:

```shell
npm install maib-mia-sdk
```

## Getting started
Import SDK:

```javascript
const {
    MaibMiaSdk,
    MaibMiaAuthRequest,
    MaibMiaApiRequest
} = require('maib-mia-sdk');
```

Add project configuration:

```javascript
const MAIB_MIA_CLIENT_ID = process.env.MAIB_MIA_CLIENT_ID;
const MAIB_MIA_CLIENT_SECRET = process.env.MAIB_MIA_CLIENT_SECRET;
const MAIB_MIA_SIGNATURE_KEY = process.env.MAIB_MIA_SIGNATURE_KEY;
```

## SDK usage examples
### Get Access Token with Client ID and Client Secret

```javascript
const maibMiaAuth = await MaibMiaAuthRequest
    .create(MaibMiaSdk.SANDBOX_BASE_URL)
    .generateToken(MAIB_MIA_CLIENT_ID, MAIB_MIA_CLIENT_SECRET);

const maibMiaToken = maibMiaAuth.accessToken;
```

### Create a dynamic order payment QR

```javascript
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
};

const maibMiaApiRequest = MaibMiaApiRequest.create(MaibMiaSdk.SANDBOX_BASE_URL);
const maibMiaQrCreateResponse = await maibMiaApiRequest.qrCreate(maibMiaQrData, maibMiaToken);
```

### Create a RTP (Request To Pay)

```javascript
const maibMiaRtpData = {
    'alias': '3736xxxxxxx',
    'amount': 150.00,
    'expiresAt': maibMiaExpiresAt,
    'currency': 'MDL',
    'description': 'Invoice #123',
    'orderId': '123',
    'terminalId': 'P011111',
    'callbackUrl': 'https://example.com/callback',
    'redirectUrl': 'https://example.com/success'
};

const maibMiaRtpCreateResponse = await maibMiaApiRequest.rtpCreate(maibMiaRtpData, maibMiaToken);
```

### Validate callback signature

```javascript
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

const validateCallbackResult = MaibMiaSdk.validateCallbackSignature(callbackData, MAIB_MIA_SIGNATURE_KEY);
```

### Get QR details

```javascript
const qrId = maibMiaQrCreateResponse.qrId;
const maibMiaQrDetailsResponse = await maibMiaApiRequest.qrDetails(qrId, maibMiaToken);
```

### Perform a test QR payment

```javascript
const maibTestPayData = {
    'qrId': qrId,
    'amount': maibMiaQrData.amount,
    'iban': 'MD88AG000000011621810140',
    'currency': maibMiaQrData.currency,
    'payerName': 'TEST QR PAYMENT'
};

const maibMiaTestPayResponse = await maibMiaApiRequest.testPay(maibTestPayData, maibMiaToken);
```

### Get payment details

```javascript
const payId = maibMiaTestPayResponse.payId;
const maibMiaPaymentDetailsResponse = await maibMiaApiRequest.paymentDetails(payId, maibMiaToken);
```

### Refund payment

```javascript
const maibMiaPaymentRefundData = {
    'reason': 'Test refund reason'
};

const maibMiaPaymentRefundResponse = await maibMiaApiRequest.paymentRefund(payId, maibMiaPaymentRefundData, maibMiaToken);
```
