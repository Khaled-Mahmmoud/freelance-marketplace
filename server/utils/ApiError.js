class ApiError extends Error {
  constructor(statusCode, message) {
    super(message); 
    this.statusCode = statusCode;
    this.isOperational = true; 
    // distinguish between operational errors (like invalid input) 
    // and programming errors (like bugs in the code).
  }
}

module.exports = ApiError;

