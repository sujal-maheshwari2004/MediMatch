/**
 * Custom application error class
 */
class AppError extends Error {
  status: number;

  /**
   * Create a new AppError
   * @param message Error message
   * @param status HTTP status code
   */
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
