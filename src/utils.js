/**
 * Node.js SDK for maib MIA API
 * Utility Functions
 */

const axios = require('axios');

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
 * Handles errors returned by the API
 * @param {axios.AxiosResponse} response - Response object
 * @param {string} endpoint - API endpoint
 */
function handleResponse(response, endpoint) {
    if (!response.data)
        throw new Error(`Invalid response received from server for endpoint ${endpoint}`);

    if (response.data.ok) {
        if (response.data.result)
            return response.data.result;

        throw new Error(`Invalid response received from server for endpoint ${endpoint}: missing 'result' field.`);
    }

    if(response.errors) {
        const error = response.errors[0];
        throw new Error(`Error sending request to endpoint ${endpoint}: ${error.errorMessage} (${error.errorCode})`);
    }

    throw new Error(`Invalid response received from server for endpoint ${endpoint}: missing 'ok' and 'errors' fields`);
}

module.exports = {
    formatDate,
    handleResponse
};