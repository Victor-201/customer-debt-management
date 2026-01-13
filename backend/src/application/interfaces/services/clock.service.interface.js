/**
 * Clock Service Interface
 * Provides standard date/time operations with timezone support
 */
class ClockServiceInterface {
    /**
     * Get current date and time
     * @returns {Date} Current date/time
     */
    now() {
        throw new Error("Method 'now()' must be implemented.");
    }

    /**
     * Get current date (without time)
     * @returns {Date} Current date at midnight
     */
    getCurrentDate() {
        throw new Error("Method 'getCurrentDate()' must be implemented.");
    }

    /**
     * Format date with timezone
     * @param {Date} date - Date to format
     * @param {string} timezone - Timezone (e.g., 'Asia/Ho_Chi_Minh', 'UTC')
     * @param {string} format - Format string (e.g., 'YYYY-MM-DD HH:mm:ss')
     * @returns {string} Formatted date string
     */
    formatWithTimezone(date, timezone, format) {
        throw new Error("Method 'formatWithTimezone()' must be implemented.");
    }

    /**
     * Convert date to specific timezone
     * @param {Date} date - Date to convert
     * @param {string} timezone - Target timezone (e.g., 'Asia/Ho_Chi_Minh', 'UTC')
     * @returns {Date} Date in target timezone
     */
    toTimezone(date, timezone) {
        throw new Error("Method 'toTimezone()' must be implemented.");
    }

    /**
     * Convert date to ISO 8601 string with timezone
     * @param {Date} date - Date to convert
     * @param {string} timezone - Timezone (optional, defaults to local)
     * @returns {string} ISO 8601 formatted string
     */
    toISOString(date, timezone = null) {
        throw new Error("Method 'toISOString()' must be implemented.");
    }
}

export default ClockServiceInterface;
