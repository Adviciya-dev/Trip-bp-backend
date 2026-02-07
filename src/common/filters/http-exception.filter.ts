import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as unknown as Record<string, unknown>;
        if (typeof resp.message === 'string') message = resp.message;
        else if (Array.isArray(resp.message) && resp.message.length > 0)
          message = String(resp.message[0]);
        if (typeof resp.error === 'string') error = resp.error;
      }
    }

    response.status(status).json({
      success: false,
      data: null,
      error,
      message,
      statusCode: status,
    });
  }
}
