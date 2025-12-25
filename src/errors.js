/**
 * Node.js SDK for maib MIA API
 * Custom Error Classes
 */

class MaibMiaError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class MaibMiaApiError extends MaibMiaError {
    constructor(message, response = null, error = null) {
        super(message, { cause: error });

        this.response = response;
    }
}

class MaibMiaValidationError extends MaibMiaError {
    constructor(message, error = null) {
        super(message, { cause: error });
    }
}

module.exports = {
    MaibMiaError,
    MaibMiaApiError,
    MaibMiaValidationError,
};
