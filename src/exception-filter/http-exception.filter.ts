import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception?.message;

    const exceptionResponse = exception.getResponse();
 
    let exceptionResponseMessage : string|string[]="Something went wrong";

    if(typeof exceptionResponse === 'object'){
        if('message' in exceptionResponse){
            if(Array.isArray(exceptionResponse.message) || typeof exceptionResponse.message === 'string'){
                exceptionResponseMessage = exceptionResponse.message;
            }
        }
        else{
            exceptionResponseMessage ="Something went wrong";    
        }
    }

    response
      .status(status)
      .json({
        error: message,
        statusCode: status,
        message: exceptionResponseMessage,
        timestamp: new Date().toISOString(),
        path: request?.url,
        method: request?.method,
      });
  }
}