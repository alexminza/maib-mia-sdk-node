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
    replacePath,
    formatDate,
    createError
};