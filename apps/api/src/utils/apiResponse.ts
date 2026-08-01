import { AppError } from './errors';

export class ApiResponseUtil {
  static success<T>(data: T, message = '', meta?: Record<string, unknown>) {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static paginated<T>(
    data: T[],
    meta: { page?: number; limit?: number; total?: number; nextCursor?: string | null },
    message = ''
  ) {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static error(message: string, statusCode = 400) {
    throw new AppError(message, statusCode);
  }
}
