/**
 * Standardized Response Handler
 * Follows JSend specification (roughly)
 */

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, error, statusCode = 500) => {
    // Hide internal errors in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message || 'Internal Server Error';

    // Log the full error for audit
    console.error(`[ERROR] ${new Date().toISOString()}:`, error);

    return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
};

module.exports = { successResponse, errorResponse };
