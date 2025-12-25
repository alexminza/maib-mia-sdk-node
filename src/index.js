/**
 * Node.js SDK for maib MIA API
 * Main Entry Point
 */

const MaibMiaSdk = require('./MaibMiaSdk');
const MaibMiaAuthRequest = require('./MaibMiaAuthRequest');
const MaibMiaApiRequest = require('./MaibMiaApiRequest');
const { MaibMiaError, MaibMiaApiError, MaibMiaValidationError } = require('./errors');

module.exports = {
    MaibMiaSdk,
    MaibMiaAuthRequest,
    MaibMiaApiRequest,
    MaibMiaError,
    MaibMiaApiError,
    MaibMiaValidationError,
};

// Default export for ES6 imports
module.exports.default = MaibMiaSdk;
