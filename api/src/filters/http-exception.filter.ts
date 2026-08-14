import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || error;
        details = (exceptionResponse as any).details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      // Log full stack trace for non-HTTP exceptions
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Handle non-Error exceptions
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
      message = 'An unexpected error occurred';
    }

    // Log the error (except for 404s to reduce noise)
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error - ${request.method} ${request.url}`,
        JSON.stringify({
          status,
          error,
          message,
          details,
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    // Construct response
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Include error type for non-production
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error = error;
      if (details) {
        errorResponse.details = details;
      }
      if (exception instanceof Error && exception.stack) {
        errorResponse.stack = exception.stack.split('\n').slice(0, 5);
      }
    }

    response.status(status).json(errorResponse);
  }
}
