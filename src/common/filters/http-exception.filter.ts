import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();
    const body     = exception.getResponse();

    response.status(status).json({
      success:    false,
      statusCode: status,
      message:    typeof body === 'string' ? body : (body as any).message,
      path:       request.url,
      timestamp:  new Date().toISOString(),
    });
  }
}
