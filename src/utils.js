/**
 * Node.js SDK for maib MIA API
 * Utility Functions
 */



/**
 * Replace path parameters in URL
 * @param {string} path - URL path with parameters
 * @param {Object} params - Parameters to replace
 * @returns {string} - Path with replaced parameters
 */
function replacePath(path, params) {
    let result = path;

    for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, value);
    }

    return result;
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @throws {Error} - If any required field is missing
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field =>
        data[field] === undefined || data[field] === null
    );

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
}

/**
 * Format date to ISO 8601 string
 * @param {Date|string} date - Date to format
 * @returns {string} - ISO formatted date string
 */
function formatDate(date) {
    if (date instanceof Date) {
        return date.toISOString();
    }

    if (typeof date === 'string') {
        return new Date(date).toISOString();
    }

    throw new Error('Invalid date format');
}

/**
 * Create error object with details
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Error} - Error object with details
 */
function createError(message, details = {}) {
    const error = new Error(message);
    error.details = details;
    return error;
}

module.exports = {
    validateCallbackSignature,
    replacePath,
    validateRequiredFields,
    formatDate,
    createError
};