import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal enterprise error occurred.';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = Array.isArray(resObj.message)
          ? resObj.message.join(', ')
          : resObj.message || exception.message;
        errorDetails = resObj.error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Do NOT log sensitive credentials or tokens
    this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: errorDetails,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
